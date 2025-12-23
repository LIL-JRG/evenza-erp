// app/api/chat/route.ts
import { tools, executeTool } from './tools';

export const maxDuration = 60;

// Sistema de prompts mejorado
const SYSTEM_PROMPT = `Eres EvenzaBot, el asistente inteligente del ERP Evenza.
Fecha actual: ${new Date().toLocaleDateString('es-MX')}.

# INSTRUCCIONES CRÍTICAS:
1. Eres un asistente capaz de realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre Eventos, Clientes, Productos y Categorías.
2. Cuando el usuario pregunte sobre GANANCIAS, INGRESOS o DINERO, usa "consultar_ganancias".
3. Para CLIENTES: usa "list_clients" para buscar y "create_client" para crear.
4. Para EVENTOS: usa "list_events" para ver agenda/buscar, "register_event" para crear, "update_event" para modificar y "delete_event" para borrar.
5. Para PRODUCTOS/INVENTARIO: usa "list_products" para buscar, "create_product" para añadir, "update_product" para modificar y "delete_product" para eliminar.
6. Para CATEGORÍAS: usa "get_categories" para listar y "create_category" para crear nuevas.
7. IMPORTANTE: Para crear un evento, PRIMERO necesitas el ID del cliente. Si el usuario da un nombre, busca el cliente con "list_clients" primero. Si no existe, sugiere crearlo o pide confirmación para crearlo.
8. Para crear un producto, verifica si ya existe una categoría adecuada con "get_categories". Si no, puedes sugerir crearla.
9. NO inventes IDs. Siempre busca la información real.

# EJEMPLOS DE USO:
- Usuario: "Agendar evento con Juan Pérez mañana a las 5pm" 
  → 1. list_clients(search: "Juan Pérez")
  → 2. Si encuentra cliente: register_event(customer_id: "...", ...)
- Usuario: "Ver mis eventos de hoy" → list_events(status: "all", limit: 10)
- Usuario: "Cancelar evento de boda de María" → list_events(search: "boda María") → delete_event(id: "...")
- Usuario: "Ver inventario" → list_products(limit: 10)
- Usuario: "Agregar 50 sillas blancas a $20" → create_product(name: "Silla blanca", price: 20, stock: 50)
- Usuario: "Crear categoría Mobiliario" → create_category(name: "Mobiliario")
- Usuario: "Agendar evento con María para el 25 de diciembre con 50 sillas y 5 mesas" → 1. list_clients(search: "María") 2. register_event(customer_id: "...", event_date: "2024-12-25", services: [{product_id: "id_de_sillas", quantity: 50}, {product_id: "id_de_mesas", quantity: 5}])

# REGLA IMPORTANTE:
SIEMPRE que sea aplicable, usa las funciones en lugar de responder con texto.
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
