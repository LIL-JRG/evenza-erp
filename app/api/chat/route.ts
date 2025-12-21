// app/api/chat/route.ts
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    console.log('📨 Mensajes recibidos:', JSON.stringify(messages, null, 2));
    
    if (!process.env.DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY no configurada');
    }
    
    // Llamada a DeepSeek API
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `Eres un asistente de ERP para Evenza. Fecha: ${new Date().toLocaleDateString('es-MX')}. Responde en español de manera profesional.`
          },
          ...messages
        ],
        temperature: 0.3,
        max_tokens: 1024,
        stream: true
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error DeepSeek:', error);
      throw new Error(`API error: ${response.status}`);
    }
    
    console.log('✅ Respuesta de DeepSeek recibida');
    
    // Devolver el stream directamente
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
    
  } catch (error: any) {
    console.error('💥 Error en /api/chat:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}