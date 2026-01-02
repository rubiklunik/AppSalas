import React, { useState, useEffect, useRef } from 'react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: string;
    status: 'sending' | 'sent' | 'error';
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string>('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textInputRef = useRef<HTMLTextAreaElement>(null);

    // Initialize Session ID
    useEffect(() => {
        let storedId = localStorage.getItem('ia_chat_session_id');
        if (!storedId) {
            storedId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('ia_chat_session_id', storedId);
        }
        setSessionId(storedId);
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isLoading]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                textInputRef.current?.focus();
            }, 300); // Wait for transition animation
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userText = inputValue.trim();
        setInputValue('');

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: userText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'sent'
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('https://n8n.japavipilab.es/webhook/8dbcf318-a1a7-46a6-a684-2cb0bc8246a4', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    userMessage: userText
                }),
            });

            if (!response.ok) throw new Error('Error en el servidor');

            const data = await response.json();

            // Handle both object response and array response from n8n
            let assistantText = 'No he podido procesar tu solicitud.';

            if (Array.isArray(data) && data.length > 0) {
                const firstResult = data[0];
                assistantText = firstResult.output || firstResult.message || (typeof firstResult === 'string' ? firstResult : assistantText);
            } else {
                assistantText = data.output || data.message || (typeof data === 'string' ? data : assistantText);
            }

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: assistantText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'sent'
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: 'Lo siento, ha ocurrido un error al conectar con el asistente.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: 'error'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            // Autofocus after sending/receiving
            setTimeout(() => {
                textInputRef.current?.focus();
            }, 100);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className={`
          bg-white dark:bg-[#1a2632] 
          rounded-2xl shadow-2xl border border-[#f0f2f4] dark:border-[#2a3b4d]
          flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right
          mb-4
          w-[360px] md:w-[400px] 
          h-[500px] md:h-[600px]
          max-h-[80vh]
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}
          fixed bottom-24 right-6 md:static
          mobile-bottom-sheet
        `}>
                    {/* Header */}
                    <div className="bg-primary p-4 text-white flex justify-between items-center shadow-md">
                        <div>
                            <h3 className="text-lg font-bold leading-tight">Asistente IA SALAS</h3>
                            <p className="text-xs text-blue-100">Pregunta lo que quieras sobre promociones</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="hover:bg-white/20 p-1 rounded-full transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-[#0d1117]">
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                                <span className="material-symbols-outlined text-4xl mb-2 opacity-20">chat_bubble</span>
                                <p className="text-sm">¡Hola! Soy tu asistente de SALAS.<br />¿En qué puedo ayudarte hoy?</p>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`
                  max-w-[85%] rounded-2xl p-3 shadow-sm
                  ${msg.role === 'user'
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-white dark:bg-[#1a2632] text-[#111418] dark:text-gray-200 border border-[#f0f2f4] dark:border-[#2a3b4d] rounded-tl-none'}
                `}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    <span className={`text-[10px] mt-1 block opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        {msg.timestamp}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-[#1a2632] text-[#111418] dark:text-gray-200 border border-[#f0f2f4] dark:border-[#2a3b4d] rounded-2xl rounded-tl-none p-3 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white dark:bg-[#1a2632] border-t border-[#f0f2f4] dark:border-[#2a3b4d]">
                        <div className="relative flex items-end gap-2">
                            <textarea
                                ref={textInputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Escribe un mensaje..."
                                rows={1}
                                disabled={isLoading}
                                className="flex-1 bg-gray-100 dark:bg-[#0d1117] border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary resize-none max-h-32 transition-all dark:text-white"
                                style={{ height: 'auto', minHeight: '44px' }}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className={`
                  p-2.5 rounded-xl flex items-center justify-center transition-all
                  ${!inputValue.trim() || isLoading
                                        ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary text-white hover:shadow-lg active:scale-95'}
                `}
                            >
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 
          ${isOpen ? 'bg-gray-100 dark:bg-[#1a2632] text-gray-600 rotate-90 scale-90' : 'bg-primary text-white hover:scale-110 active:scale-95'}
        `}
            >
                <span className="material-symbols-outlined text-3xl">
                    {isOpen ? 'close' : 'chat'}
                </span>
            </button>

            <style>{`
        @media (max-width: 640px) {
          .mobile-bottom-sheet {
            width: calc(100vw - 32px) !important;
            height: 70vh !important;
            right: 16px !important;
            bottom: 80px !important;
            left: 16px !important;
          }
        }
      `}</style>
        </div>
    );
};

export default ChatWidget;
