import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

export default function GemmaChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            // Include history in prompt (simple method)
            const historyText = messages.map(m => `${m.role === 'user' ? 'User' : 'Gemma'}: ${m.content}`).join('\n');
            const fullPrompt = `${historyText}\nUser: ${input}\nGemma:`;

            const response = await fetch('/api/llm/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: fullPrompt
                })
            });

            if (!response.ok) throw new Error('Failed to fetch response');

            const data = await response.json();
            const botMsg = { role: 'assistant', content: data.response };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + err.message }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl text-white mt-8 h-[600px] flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Chat with Gemma</h2>

            <div className="flex-1 overflow-y-auto mb-4 p-4 bg-gray-900 rounded border border-gray-700 space-y-4">
                {messages.length === 0 && (
                    <div className="text-gray-500 text-center mt-20">
                        Start a conversation with Gemma 3 (1B)...
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user'
                                ? 'bg-blue-600'
                                : 'bg-purple-900/40 border border-purple-500/30'
                            }`}>
                            <div className="prose prose-invert text-sm">
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-purple-900/40 px-4 py-2 rounded-lg border border-purple-500/30">
                            <span className="animate-pulse">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 rounded bg-gray-700 border border-gray-600 focus:border-purple-500 focus:outline-none text-white"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded font-semibold transition disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
