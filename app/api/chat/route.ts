// app/api/chat/route.ts
import { tools, executeTool } from './tools';

export const maxDuration = 60;

// Sistema de prompts mejorado
const SYSTEM_PROMPT = `Eres EvenzaBot, el asistente inteligente del ERP Evenza.
Fecha actual: ${new Date().toLocaleDateString('es-MX')}.

# REGLAS FUNDAMENTALES - NUNCA LAS VIOLES:
1. ❌ NUNCA inventes IDs, fechas de creación, o cualquier dato que no hayas recibido de una función.
2. ❌ NUNCA asumas que una operación fue exitosa sin esperar el resultado de la función.
3. ❌ NUNCA respondas con datos antes de ejecutar la función correspondiente.
4. ✅ SIEMPRE espera el resultado real de las funciones antes de informar al usuario.
5. ✅ SIEMPRE usa los datos exactos que devuelven las funciones (IDs, fechas, nombres, etc.).
6. ✅ Si una función falla o no devuelve datos, informa el error al usuario honestamente.

# INSTRUCCIONES OPERATIVAS:
1. Para CLIENTES: usa "list_clients" para buscar y "create_client" para crear.
2. Para EVENTOS: usa "list_events" para ver agenda/buscar, "register_event" para crear (genera cotización automática), "update_event" para modificar y "delete_event" para borrar.
3. Para PRODUCTOS/INVENTARIO: usa "list_products" para buscar, "create_product" para añadir, "update_product" para modificar y "delete_product" para eliminar.
4. Para CATEGORÍAS: usa "get_categories" para listar y "create_category" para crear nuevas.
5. Para RECIBOS/COTIZACIONES: cuando crees un evento, se genera automáticamente una cotización. Informa al usuario de esto.

# FLUJO CORRECTO PARA CREAR UN EVENTO:
1. Buscar el cliente con "list_clients" (si el usuario da un nombre)
2. Si no existe, preguntar si quiere crearlo
3. Si existe, buscar productos con "list_products" (si menciona productos)
4. Llamar a "register_event" con los IDs correctos
5. ESPERAR el resultado
6. Solo entonces informar con los datos reales devueltos por la función

# EJEMPLO CORRECTO:
Usuario: "Crear evento para Juan mañana"
Asistente: *llama list_clients(search: "Juan")*
[Resultado: {id: "abc-123", name: "Juan Pérez"}]
Asistente: *llama register_event con customer_id: "abc-123"*
[Resultado: {id: "evt-456", title: "...", created_at: "2024-12-23"}]
Asistente: "✅ Evento creado exitosamente! ID: evt-456, Cliente: Juan Pérez, Fecha de creación: 23/12/2024. Se generó automáticamente una cotización en estado Borrador."

# EJEMPLO INCORRECTO (NUNCA HAGAS ESTO):
Usuario: "Crear evento para Juan"
Asistente: "✅ Evento creado! ID: 12345..." ← ❌ ERROR: Inventó el ID antes de llamar la función

# REGLA DE ORO:
Si no has llamado a una función y esperado su resultado, NO INFORMES sobre la operación.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    console.log('📨 Mensaje del usuario:', messages[messages.length - 1]?.content);
    
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY no configurada');
    }
    
    // Agregar mensaje del sistema
    const allMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages
    ];
    
    // Primera llamada: Obtener respuesta con posibles tool calls
    const controller1 = new AbortController();
    const timeout1 = setTimeout(() => controller1.abort(), 50000); // 50s timeout

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: allMessages,
        tools: tools,
        tool_choice: "auto", // IMPORTANTE: Permite que el modelo elija
        temperature: 0.1, // Baja temperatura para consistencia
        max_tokens: 1000,
        stream: false // Primero sin streaming
      }),
      signal: controller1.signal
    }).finally(() => clearTimeout(timeout1));
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error DeepSeek:', error);
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    const assistantMessage = data.choices[0].message;
    
    console.log('🤖 Respuesta de DeepSeek:', JSON.stringify(assistantMessage, null, 2));
    
    // Verificar si hay tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log('✅ Tool calls detectadas!', assistantMessage.tool_calls);
      
      // Ejecutar las tools
      const toolResults = [];
      
      for (const toolCall of assistantMessage.tool_calls) {
        try {
          // Ejecutar la tool usando la lógica real
          const result = await executeTool(toolCall);
          
          toolResults.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: JSON.stringify(result)
          });
          
        } catch (error: any) {
          console.error('Error ejecutando tool:', error);
          toolResults.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: toolCall.function.name,
            content: JSON.stringify({ error: error.message })
          });
        }
      }
      
      // Segunda llamada: Enviar resultados de tools para obtener respuesta final
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 50000);

      const finalResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            ...allMessages,
            assistantMessage,
            ...toolResults
          ],
          temperature: 0.3,
          max_tokens: 1500,
          stream: true // Ahora sí streaming
        }),
        signal: controller2.signal
      }).finally(() => clearTimeout(timeout2));
      
      return new Response(finalResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
      
    } else {
      // Si no hay tool calls, convertir respuesta a stream
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          
          // Enviar contenido en chunks para simular streaming
          const content = assistantMessage.content || "No tengo una respuesta específica.";
          const chunkSize = 20;
          
          let index = 0;
          
          const sendChunk = () => {
            if (index < content.length) {
              const chunk = content.slice(index, index + chunkSize);
              const data = {
                id: `chatcmpl-${Date.now()}`,
                object: "chat.completion.chunk",
                created: Math.floor(Date.now() / 1000),
                model: "deepseek-chat",
                choices: [{
                  index: 0,
                  delta: { content: chunk },
                  finish_reason: null
                }]
              };
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
              index += chunkSize;
              
              // Simular velocidad de escritura
              setTimeout(sendChunk, 50);
            } else {
              // Finalizar
              const finalData = {
                id: `chatcmpl-${Date.now()}`,
                object: "chat.completion.chunk",
                created: Math.floor(Date.now() / 1000),
                model: "deepseek-chat",
                choices: [{
                  index: 0,
                  delta: {},
                  finish_reason: "stop"
                }]
              };
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            }
          };
          
          sendChunk();
        }
      });
      
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
    
  } catch (error: any) {
    console.error('💥 Error en /api/chat:', error);
    
    // Stream de error
    const errorStream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        const errorMsg = "❌ Lo siento, hubo un error. Por favor, intenta nuevamente.";
        
        const data = {
          id: `chatcmpl-${Date.now()}`,
          object: "chat.completion.chunk",
          created: Math.floor(Date.now() / 1000),
          model: "deepseek-chat",
          choices: [{
            index: 0,
            delta: { content: errorMsg },
            finish_reason: "stop"
          }]
        };
        
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      }
    });
    
    return new Response(errorStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
