// app/api/chat/route.ts
import { tools, executeTool } from './tools';

export const maxDuration = 60;

// Sistema de prompts mejorado
const SYSTEM_PROMPT = `Eres EvenzaBot, el asistente inteligente del ERP Evenza.
Fecha actual: ${new Date().toLocaleDateString('es-MX')}.

# ⚠️ ADVERTENCIA CRÍTICA - LEER PRIMERO ⚠️
NUNCA, BAJO NINGUNA CIRCUNSTANCIA, INVENTES DATOS. SI NO HAS LLAMADO A UNA FUNCIÓN Y RECIBIDO SU RESULTADO, NO PUEDES SABER EL RESULTADO.

# REGLAS FUNDAMENTALES - VIOLACIÓN = FALLO TOTAL:
1. ❌ PROHIBIDO ABSOLUTAMENTE inventar IDs (como "6e7e8e9e-0e1e..." o "4e5e6e7e-8e9e...")
2. ❌ PROHIBIDO ABSOLUTAMENTE decir "Evento creado" sin haber recibido confirmación de la función
3. ❌ PROHIBIDO ABSOLUTAMENTE inventar fechas de creación, números de factura, o cualquier dato
4. ❌ PROHIBIDO ABSOLUTAMENTE asumir que una operación fue exitosa sin ver el resultado
5. ✅ OBLIGATORIO: Esperar el resultado REAL de CADA función antes de mencionar cualquier dato
6. ✅ OBLIGATORIO: Usar SOLAMENTE los datos EXACTOS que devuelven las funciones
7. ✅ OBLIGATORIO: Si una función falla, informa "ERROR: [mensaje]" y DETENTE inmediatamente

# VALIDACIÓN DE IDs - CRÍTICO:
- Los IDs reales de UUID tienen formato: "c8bb1dda-95a8-4a3b-9a14-e5f138a70942" (aleatorio)
- NUNCA uses IDs que parezcan inventados o repetitivos
- NUNCA uses IDs que no hayas recibido EXPLÍCITAMENTE de una función
- Si ves un ID como "4e5e6e7e-8e9e-0e1e-2e3e-4e5e6e7e8e9e" → ESTO ES INVENTADO, NO LO USES

# INSTRUCCIONES OPERATIVAS:
1. Para CLIENTES: usa "list_clients" para buscar y "create_client" para crear.
2. Para EVENTOS: usa "list_events" para ver agenda/buscar, "register_event" para crear (genera cotización automática), "update_event" para modificar y "delete_event" para borrar.
3. Para PRODUCTOS/INVENTARIO: usa "list_products" para buscar, "create_product" para añadir, "update_product" para modificar y "delete_product" para eliminar.
4. Para CATEGORÍAS: usa "get_categories" para listar y "create_category" para crear nuevas.
5. Para RECIBOS/COTIZACIONES: cuando crees un evento con estado "draft", se genera automáticamente una cotización.
   - IMPORTANTE: Verifica el campo "_quote_created" en la respuesta de "register_event"
   - Si "_quote_created" es true, informa: "✅ Se generó automáticamente una cotización en estado Borrador"
   - Si "_quote_created" es false, informa: "⚠️ El evento se creó pero hubo un problema al generar la cotización automática. Puedes crearla manualmente desde el panel de recibos"
   - Si hay "_quote_error", inclúyelo en tu respuesta para que el usuario sepa qué falló

# FLUJO CORRECTO PARA CREAR UN EVENTO:
1. Buscar el cliente con "list_clients" (si el usuario da un nombre)
2. VERIFICAR que la búsqueda devolvió resultados. Si no existe, preguntar si quiere crearlo
3. USAR EXACTAMENTE el ID devuelto por "list_clients" (NO inventar IDs)
4. Si existe, buscar productos con "list_products" (si menciona productos)
5. Llamar a "register_event" con los IDs exactos de las funciones anteriores
6. ESPERAR el resultado
7. Si hay error (ej: foreign key constraint), informar que el cliente no existe y ofrecer crearlo
8. Solo entonces informar con los datos reales devueltos por la función

# EJEMPLO CORRECTO:
Usuario: "Crear evento para Juan mañana"
Paso 1: Asistente llama list_clients(search: "Juan")
Paso 2: Función devuelve: [{id: "c8bb1dda-95a8-4a3b-9a14-e5f138a70942", full_name: "Juan Pérez"}]
Paso 3: Asistente llama register_event con customer_id: "c8bb1dda-95a8-4a3b-9a14-e5f138a70942"
Paso 4: Función devuelve: {id: "35a11454-6e5c-4414-a6c9-39c9242629a1", title: "...", created_at: "2025-12-23T..."}
Paso 5: SOLO AHORA el asistente responde: "✅ Evento creado! ID: 35a11454-6e5c-4414-a6c9-39c9242629a1"

# EJEMPLOS INCORRECTOS (NUNCA HAGAS ESTO):
❌ MAL: "✅ Evento creado! ID: 6e7e8e9e-0e1e-2e3e..." ← Inventó el ID
❌ MAL: "Se generó automáticamente una cotización" ← No verificó _quote_created
❌ MAL: "Cliente: Adriana (ID: 4e5e6e7e...)" ← Inventó el customer_id
❌ MAL: Responder con datos ANTES de recibir la respuesta de la función

# REGLA DE ORO - ABSOLUTAMENTE OBLIGATORIA:
1. SI NO HAS RECIBIDO EL RESULTADO DE LA FUNCIÓN → NO DIGAS NADA SOBRE ESE RESULTADO
2. SI LA FUNCIÓN DEVOLVIÓ ERROR → DI "ERROR: [mensaje]" Y NO INVENTES DATOS
3. SI NO ESTÁS 100% SEGURO DEL DATO → NO LO MENCIONES
`;

// Función para detectar IDs inventados con patrones sospechosos
function detectFakeUUIDs(text: string): boolean {
  // Patrones sospechosos de UUIDs inventados
  const suspiciousPatterns = [
    /[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}/gi, // UUID general
  ];

  for (const pattern of suspiciousPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      for (const uuid of matches) {
        // Verificar si el UUID tiene patrones repetitivos sospechosos
        // Ejemplo: "6e7e8e9e-0e1e-2e3e-4e5e-6e7e8e9e0e1e" tiene "e" repetido
        const parts = uuid.split('-');
        const suspicious = parts.some(part => {
          // Si tiene más de 50% de caracteres repetidos, es sospechoso
          const charCount: Record<string, number> = {};
          for (const char of part) {
            charCount[char] = (charCount[char] || 0) + 1;
          }
          const maxRepeat = Math.max(...Object.values(charCount));
          return maxRepeat > part.length * 0.5;
        });
        if (suspicious) {
          console.warn('⚠️ UUID sospechoso detectado:', uuid);
          return true;
        }
      }
    }
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

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
        temperature: 0.0, // Temperatura CERO para máxima determinismo y evitar alucinaciones
        max_tokens: 1000,
        stream: false, // Primero sin streaming
        top_p: 0.1 // Muy bajo para evitar respuestas aleatorias
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

    // Verificar si hay tool calls
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      
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

      // Validar que los resultados de las tools no contengan errores críticos
      const hasErrors = toolResults.some(result => {
        try {
          const content = JSON.parse(result.content);
          return content.error || content.code === 'CUSTOMER_NOT_FOUND';
        } catch {
          return false;
        }
      });

      // Si hay errores, agregar instrucción adicional
      const finalMessages = hasErrors
        ? [
            ...allMessages,
            assistantMessage,
            ...toolResults,
            {
              role: 'system',
              content: 'ADVERTENCIA: Una o más funciones devolvieron error. Informa al usuario del error exacto. NO inventes datos alternativos.'
            }
          ]
        : [...allMessages, assistantMessage, ...toolResults];

      const finalResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: finalMessages,
          temperature: 0.0, // Temperatura CERO para evitar inventar datos
          max_tokens: 1500,
          stream: true, // Ahora sí streaming
          top_p: 0.1 // Muy bajo para evitar respuestas aleatorias
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
