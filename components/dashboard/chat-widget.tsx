'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  User, 
  Sparkles,
  RefreshCw,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ToolCall { 
  id: string; 
  type: 'function'; 
  function: { 
    name: string; 
    arguments: string; 
  }; 
} 

interface ChatResponse { 
  content: string; 
  tool_calls?: ToolCall[]; 
} 

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Función para limpiar markup de DeepSeek
function cleanDeepSeekMarkup(text: string): string {
  // Remover todo el bloque de markup de DeepSeek (incluyendo saltos de línea)
  const regex = /<｜DSML｜[^]*?<\/｜DSML｜>/g;
  let cleaned = text.replace(regex, '');

  // También remover tags individuales que puedan quedar
  cleaned = cleaned.replace(/<｜DSML｜[^>]*>/g, '');
  cleaned = cleaned.replace(/<\/｜DSML｜[^>]*>/g, '');

  // Limpiar espacios en blanco excesivos
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();

  return cleaned;
}

export function ChatWidget({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecutingFunction, setIsExecutingFunction] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Persistence Constants
  const STORAGE_KEY = 'evenza_chat_history';
  const DATE_KEY = 'evenza_chat_date';
  const UI_STATE_KEY = 'evenza_chat_ui_state';

  // Load persisted state on mount
  useEffect(() => {
    // 1. Restore UI State
    const savedUIState = localStorage.getItem(UI_STATE_KEY);
    if (savedUIState) {
      try {
        const { isOpen: savedIsOpen, isMinimized: savedIsMinimized } = JSON.parse(savedUIState);
        setIsOpen(savedIsOpen);
        setIsMinimized(savedIsMinimized);
      } catch (e) {
        console.error('Error restoring UI state:', e);
      }
    }

    // 2. Restore Messages (check date)
    const savedDate = localStorage.getItem(DATE_KEY);
    const today = new Date().toLocaleDateString();

    if (savedDate !== today) {
      // New day, clear history
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(DATE_KEY, today);
    } else {
      const savedMessages = localStorage.getItem(STORAGE_KEY);
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages);
          setMessages(parsed.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })));
        } catch (e) {
          console.error('Error restoring chat history:', e);
        }
      }
    }
  }, []);

  // Save messages to storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
      localStorage.setItem(DATE_KEY, new Date().toLocaleDateString());
    }
  }, [messages]);

  // Save UI state to storage
  useEffect(() => {
    localStorage.setItem(UI_STATE_KEY, JSON.stringify({ isOpen, isMinimized }));
  }, [isOpen, isMinimized]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    const userMessageId = `user-${Date.now()}`;
    
    // 1. Agregar mensaje del usuario
    const newMessages: ChatMessage[] = [
      ...messages,
      {
        id: userMessageId,
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      }
    ];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      // 2. Enviar petición al servidor
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      // Check for JSON response (Tool Calls)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json(); 
        const chatResponse: ChatResponse = data.choices[0].message; 
        
        // Mostrar indicador de acción cuando se llama a una tool 
        if (chatResponse.tool_calls) { 
          // Mostrar mensaje de "Procesando acción..." 
          const actionMessage = chatResponse.tool_calls.map(tc => 
            `Ejecutando: ${tc.function.name}` 
          ).join(', '); 
          
          // Agregar mensaje informativo 
          setMessages(prev => [...prev, { 
            id: `action-${Date.now()}`, 
            role: 'assistant', 
            content: `🔄 ${actionMessage}...`, 
            timestamp: new Date() 
          }]); 
        }

        if (chatResponse.content) {
          // Limpiar el markup de DeepSeek del contenido
          const cleanedContent = cleanDeepSeekMarkup(chatResponse.content);
          if (cleanedContent) {  // Solo agregar si hay contenido después de limpiar
            setMessages(prev => [...prev, {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: cleanedContent,
              timestamp: new Date()
            }]);
          }
        }
        
        return;
      }
      
      // 3. Preparar para recibir stream
      const assistantMessageId = `assistant-${Date.now()}`;
      let assistantContent = '';
      
      // 4. Agregar mensaje vacío del asistente
      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date()
        }
      ]);
      
      // 5. Leer el stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No se pudo leer la respuesta');
      }
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decodificar el chunk
        const chunk = decoder.decode(value);
        
        // Procesar el stream SSE
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.trim() === '' || !line.startsWith('data: ')) continue;
          
          const data = line.slice(6); // Remover "data: "
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || '';
            if (content) {
              // Detectar si está ejecutando una función
              if (content.includes('<｜DSML｜function_calls>')) {
                setIsExecutingFunction(true);
                continue; // Saltar este chunk
              }

              // Detectar fin de ejecución de función
              if (content.includes('</｜DSML｜function_calls>')) {
                setIsExecutingFunction(false);
                continue; // Saltar este chunk
              }

              // Filtrar cualquier markup de DeepSeek
              if (content.includes('<｜DSML｜') || content.includes('</｜DSML｜>')) {
                continue; // Saltar este chunk
              }

              // Solo agregar contenido limpio
              assistantContent += content;

              // Limpiar cualquier markup residual antes de mostrar
              const cleanContent = cleanDeepSeekMarkup(assistantContent);

              // Actualizar el mensaje del asistente
              setMessages(prev => prev.map(msg =>
                msg.id === assistantMessageId
                  ? { ...msg, content: cleanContent }
                  : msg
              ));
            }
          } catch (e) {
            console.warn('Error parsing JSON:', e);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Error en el chat:', error);

      // Mostrar mensaje de error
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
      setIsExecutingFunction(false);
    }
  };
  
  const handleNewChat = () => {
    setMessages([]);
    setInput('');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(DATE_KEY, new Date().toLocaleDateString());
    inputRef.current?.focus();
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isMinimized, isLoading]);

  return (
    <div className={cn("fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans", className)}>
      {/* Chat Window */}
      {isOpen && !isMinimized && (
        <Card className="w-[380px] h-[600px] shadow-2xl border-none ring-1 ring-black/5 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 rounded-2xl p-0 gap-0">
          {/* Header */}
          <CardHeader className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-row items-center justify-between shrink-0 shadow-md z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-tight">Asistente Evenza</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  {isExecutingFunction ? '⚡ Ejecutando acción...' : isLoading ? 'Escribiendo...' : 'En línea ahora'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-slate-300 hover:text-white hover:bg-white/10 rounded-full"
                      onClick={handleNewChat}
                      disabled={isLoading}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reiniciar chat</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-300 hover:text-white hover:bg-white/10 rounded-full"
                onClick={() => setIsMinimized(true)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-slate-300 hover:text-white hover:bg-white/10 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          {/* Messages Area */}
          <CardContent className="flex-1 p-0 overflow-hidden relative bg-slate-50/50">
            <ScrollArea className="h-full px-4 py-6" ref={scrollAreaRef}>
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
                  <div className="space-y-2 max-w-[250px]">
                    <h4 className="font-semibold text-slate-800">¿En qué puedo ayudarte?</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      Soy tu asistente inteligente. Puedo ayudarte a gestionar tu ERP, buscar clientes o resolver dudas.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 w-full max-w-[280px]">
                    {['Resumen de ventas', 'Crear nuevo cliente', 'Ver inventario'].map((suggestion) => (
                      <button 
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion);
                          inputRef.current?.focus();
                        }}
                        className="text-xs py-2 px-4 rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 transition-colors text-center shadow-sm"
                      >
                        "{suggestion}"
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6 pb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3 max-w-[85%] group",
                        message.role === 'user' ? "ml-auto" : ""
                      )}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="w-8 h-8 border shadow-sm mt-1 shrink-0">
                          <AvatarFallback className="bg-slate-900 text-white">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex flex-col gap-1 w-full overflow-hidden">
                        <div className={cn(
                          "p-3.5 text-sm shadow-sm relative",
                          message.role === 'user' 
                            ? "bg-slate-900 text-white rounded-2xl rounded-tr-sm ml-auto" 
                            : "bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-tl-sm"
                        )}>
                          {message.role === 'user' ? (
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </div>
                          ) : (
                            <div className="markdown-content">
                              <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({node, ...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                  ul: ({node, ...props}) => <ul className="my-2 ml-4 list-disc space-y-1" {...props} />,
                                  ol: ({node, ...props}) => <ol className="my-2 ml-4 list-decimal space-y-1" {...props} />,
                                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                  strong: ({node, ...props}) => <span className="font-semibold text-slate-900" {...props} />,
                                  a: ({node, ...props}) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                  code: ({node, ...props}) => {
                                    // @ts-ignore - inline is not in the types but is passed by react-markdown
                                    const {inline, className, children} = props;
                                    return inline ? (
                                      <code className="bg-slate-100 px-1 py-0.5 rounded text-xs font-mono text-slate-800" {...props} />
                                    ) : (
                                      <div className="bg-slate-100 p-2 rounded-md my-2 overflow-x-auto">
                                        <code className="text-xs font-mono text-slate-800 block" {...props} />
                                      </div>
                                    );
                                  },
                                  table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="min-w-full border-collapse border border-slate-200 text-xs" {...props} /></div>,
                                  thead: ({node, ...props}) => <thead className="bg-slate-50" {...props} />,
                                  tbody: ({node, ...props}) => <tbody className="bg-white" {...props} />,
                                  tr: ({node, ...props}) => <tr className="border-b border-slate-100 last:border-0" {...props} />,
                                  th: ({node, ...props}) => <th className="border-r border-slate-200 last:border-0 px-2 py-1.5 text-left font-medium text-slate-600" {...props} />,
                                  td: ({node, ...props}) => <td className="border-r border-slate-200 last:border-0 px-2 py-1.5" {...props} />,
                                  blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-slate-300 pl-3 my-2 italic text-slate-500" {...props} />,
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                        <span className={cn(
                          "text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity px-1",
                          message.role === 'user' ? "text-right" : "text-left"
                        )}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {/* Indicador cuando está ejecutando una función */}
                  {isExecutingFunction && (
                    <div className="flex gap-3 max-w-[85%]">
                       <Avatar className="w-8 h-8 border shadow-sm mt-1 shrink-0">
                          <AvatarFallback className="bg-purple-600 text-white">
                            <Sparkles className="w-4 h-4" />
                          </AvatarFallback>
                       </Avatar>
                       <div className="p-3.5 rounded-2xl rounded-tl-sm bg-purple-50 border border-purple-200 shadow-sm">
                         <div className="flex gap-2 items-center">
                           <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                           <span className="text-sm text-purple-700">Ejecutando acción...</span>
                         </div>
                       </div>
                    </div>
                  )}

                  {/* Indicador de escritura estándar */}
                  {isLoading && !isExecutingFunction && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
                    <div className="flex gap-3 max-w-[85%]">
                       <Avatar className="w-8 h-8 border shadow-sm mt-1 shrink-0">
                          <AvatarFallback className="bg-slate-900 text-white">
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                       </Avatar>
                       <div className="p-4 rounded-2xl rounded-tl-sm bg-white border border-slate-100 shadow-sm">
                         <div className="flex gap-1.5 items-center h-full">
                           <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                           <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                           <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                         </div>
                       </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </CardContent>

          {/* Input Area */}
          <CardFooter className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSubmit} className="flex w-full gap-2 items-end relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 min-h-[44px] pr-10 rounded-xl"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className={cn(
                  "absolute right-1.5 bottom-1.5 h-8 w-8 rounded-lg transition-all duration-200",
                  input.trim() 
                    ? "bg-slate-900 hover:bg-slate-800 text-white" 
                    : "bg-transparent text-slate-300 hover:bg-slate-100"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      {/* Trigger Button */}
      <div className="relative group">
        {isMinimized && isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white z-10 animate-pulse"></span>
        )}
        <Button
          onClick={() => {
            if (isOpen && isMinimized) {
              setIsMinimized(false);
            } else {
              setIsOpen(!isOpen);
            }
          }}
          size="icon"
          className={cn(
            "h-14 w-14 rounded-full shadow-xl transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl",
            isOpen && !isMinimized 
              ? "bg-slate-800 rotate-90" 
              : "bg-gradient-to-tr from-slate-900 to-slate-700"
          )}
        >
          {isOpen && !isMinimized ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <MessageCircle className="w-7 h-7 text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}
