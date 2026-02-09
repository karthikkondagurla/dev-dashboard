import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function McpChat() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedLib, setSelectedLib] = useState(null);
    const [docs, setDocs] = useState(null);
    const [llmResponse, setLlmResponse] = useState(null);
    const [llmLoading, setLlmLoading] = useState(false);

    const searchLibraries = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        setResults(null);
        setDocs(null);
        setSelectedLib(null);

        try {
            // First, try to find the 'resolve-library-id' tool (or similar)
            // For this implementation, we'll try to fetch tools first to be robust, 
            // but to save RTT we'll assume the standard Context7 tool name if we can.
            // Let's just try calling 'resolve-library-id' directly.

            const response = await fetch('/api/mcp/call', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: 'resolve-library-id',
                    args: {
                        libraryName: query,
                        query: query
                    }
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            // Context7 'resolve-library-id' typically returns a list of libraries
            setResults(data);

            // Auto-select the first valid Library ID
            if (data.content && data.content.length > 0) {
                const text = data.content.find(i => i.type === 'text')?.text || '';
                // Regex to find 'Library ID: /org/repo'
                const match = text.match(/Library ID:.*?(\/[\w\-\.\/]+)/i);

                if (match && match[1]) {
                    const autoId = match[1];
                    console.log('Auto-selecting library:', autoId);
                    await fetchDocs(autoId);
                }
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const askGemma = async () => {
        if (!docs) return;
        setLlmLoading(true);
        setLlmResponse(null);

        try {
            const contextText = docs.content.map(b => b.text).join('\n\n');
            const response = await fetch('/api/llm/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: query,
                    context: contextText
                })
            });

            if (!response.ok) throw new Error('Failed to fetch from LLM');

            const data = await response.json();
            setLlmResponse(data.response);
        } catch (err) {
            setError('LLM Error: ' + err.message);
        } finally {
            setLlmLoading(false);
        }
    };

    const fetchDocs = async (libId) => {
        setLoading(true);
        setError(null);
        setSelectedLib(libId);

        try {
            const response = await fetch('/api/mcp/call', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'query-docs', // Corrected tool name
                    args: { libraryId: libId, query: query } // It often takes the query too to filter docs
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            setDocs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-xl text-white mt-8">
            <h2 className="text-2xl font-bold mb-4 text-blue-400">Context7 MCP Search</h2>
            <p className="mb-4 text-gray-300">Find up-to-date documentation for your libraries.</p>

            <form onSubmit={searchLibraries} className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., 'python polars join dataframe' or just 'polars'..."
                    className="flex-1 p-3 rounded bg-gray-700 border border-gray-600 focus:border-blue-500 focus:outline-none text-white"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition disabled:opacity-50"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>

            {error && (
                <div className="p-4 mb-4 bg-red-900/50 border border-red-500 rounded text-red-200">
                    Error: {error}
                </div>
            )}

            {/* Library Selection Step */}
            {results && !docs && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Select a Library:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Parse results content to find list. Content is usually array of text/mixed. */}
                        {results.content && results.content.map((item, idx) => (
                            <div key={idx} className="bg-gray-700 p-4 rounded">
                                <pre className="whitespace-pre-wrap text-sm font-mono overflow-auto max-h-60">
                                    {item.text}
                                </pre>
                                {/* 
                            Since we don't know the EXACT JSON format returned by resolve-library-id text,
                            we might need to parse it or just display it.
                            Context7 often returns a JSON string block in the text.
                            For now, let's assume the user has to read it, BUT
                            to make it interactive, we need to extract IDs.
                            
                            If we can't parse it easily, we just providing a fallback input for ID.
                         */}
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 p-4 bg-gray-700/50 rounded">
                        <p className="text-sm text-gray-400 mb-2">
                            Copy a Library ID from above (if available) and click below to get docs.
                        </p>
                        {/* Fallback Manual Entry if UI parsing fails */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter Library ID (e.g. 'polars')"
                                id="manual-lib-id"
                                className="flex-1 p-2 rounded bg-gray-600 border border-gray-500"
                            />
                            <button
                                onClick={() => fetchDocs(document.getElementById('manual-lib-id').value)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
                            >
                                Get Docs
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Documentation Display Step */}
            {docs && (
                <div className="mt-6 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-green-400">Documentation Results</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const text = docs.content.map(b => b.text).join('\n\n');
                                    navigator.clipboard.writeText(text);
                                }}
                                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded text-sm text-white"
                            >
                                Copy All
                            </button>
                            <button
                                onClick={askGemma}
                                disabled={llmLoading}
                                className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm text-white disabled:opacity-50"
                            >
                                {llmLoading ? 'Asking Gemma...' : 'Ask Gemma'}
                            </button>
                            <button onClick={() => { setDocs(null); setLlmResponse(null); }} className="text-sm text-gray-400 hover:text-white">Back</button>
                        </div>
                    </div>

                    {/* LLM Response Area */}
                    {llmResponse && (
                        <div className="bg-purple-900/20 p-6 rounded-lg border border-purple-500/50 mb-6">
                            <h3 className="text-lg font-bold text-purple-300 mb-2">Gemma says:</h3>
                            <div className="prose prose-invert max-w-none">
                                <ReactMarkdown>{llmResponse}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                    <div className="prose prose-invert max-w-none bg-gray-900 p-6 rounded-lg border border-gray-700">
                        {docs.content && docs.content.map((block, i) => (
                            <ReactMarkdown key={i}>{block.text}</ReactMarkdown>
                        ))}
                    </div>
                    <div className="bg-blue-900/30 p-4 rounded border border-blue-500/30">
                        <p className="text-sm text-blue-200">
                            <strong>Tip:</strong> Data is ready. Copy above or use the button to paste into your LLM.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
