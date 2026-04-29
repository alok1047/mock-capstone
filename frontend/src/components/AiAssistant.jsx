import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { aiSearch } from '../api/aiApi';

/**
 * Floating AI assistant for natural-language lost/found search.
 *
 * UX:
 *  - Pill button bottom-right opens a panel
 *  - Greeting + suggested prompts
 *  - Typing indicator while the request is in flight
 *  - Result cards link to the item detail page
 *  - Mobile: full-width sheet at the bottom
 */

const SUGGESTIONS = [
  'I lost my black wallet near railway station',
  'I lost AirPods near college gate',
  'I found a blue bag in the market',
];

const Bubble = ({ from, children }) => (
  <div
    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
      from === 'user'
        ? 'self-end bg-brand-blue text-white rounded-br-sm'
        : 'self-start bg-gray-100 text-gray-800 rounded-bl-sm'
    }`}
  >
    {children}
  </div>
);

const TypingDots = () => (
  <div className="self-start bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
    <div className="flex gap-1">
      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '120ms' }} />
      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '240ms' }} />
    </div>
  </div>
);

const ResultCard = ({ item }) => (
  <Link
    to={`/item/${item._id}`}
    className="flex gap-3 p-2 rounded-lg border border-gray-200 hover:border-brand-blue hover:shadow-sm transition bg-white"
  >
    <div className="h-14 w-14 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
      {item.image ? (
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">No image</div>
      )}
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
        <span
          className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${
            item.status === 'lost'
              ? 'bg-red-100 text-red-600'
              : item.status === 'found'
              ? 'bg-green-100 text-green-600'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {item.status}
        </span>
      </div>
      <p className="text-xs text-gray-500 truncate">{item.location}</p>
      <p className="text-xs text-gray-500 truncate">{item.description}</p>
    </div>
  </Link>
);

const AiAssistant = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Hi! I'm your lost-and-found assistant. Tell me what you lost or found in plain English — e.g. \"I lost my black wallet near railway station\".",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, open]);

  const send = async (text) => {
    const query = text.trim();
    if (!query || loading) return;
    setMessages((m) => [...m, { from: 'user', text: query }]);
    setInput('');
    setLoading(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const data = await aiSearch(query, { signal: ctrl.signal });
      setMessages((m) => [
        ...m,
        { from: 'bot', text: data.reply, results: data.results || [] },
      ]);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setMessages((m) => [
        ...m,
        {
          from: 'bot',
          text:
            err.message ||
            "I'm having trouble reaching the search service. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    send(input);
  };

  return (
    <>
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close assistant' : 'Open AI assistant'}
        className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-3 rounded-full shadow-lift transition-transform hover:-translate-y-0.5 active:scale-95"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.418-4.03 8-9 8a9.72 9.72 0 01-4-.86L3 20l1.16-3.86A8.42 8.42 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className="font-semibold text-sm hidden sm:inline">
          {open ? 'Close' : 'Ask AI'}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="AI lost-and-found assistant"
          className="fixed z-50 bottom-20 right-3 left-3 sm:left-auto sm:right-5 sm:bottom-24 w-auto sm:w-[380px] max-h-[78vh] flex flex-col rounded-2xl bg-white border border-gray-200 shadow-lift animate-fadeInUp"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-teal flex items-center justify-center text-white font-bold">AI</div>
              <div>
                <p className="font-semibold text-sm text-gray-800">Lost & Found Assistant</p>
                <p className="text-[11px] text-gray-500">Ask in plain English</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-700"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 flex flex-col">
            {messages.map((m, i) => (
              <React.Fragment key={i}>
                <Bubble from={m.from}>{m.text}</Bubble>
                {m.results && m.results.length > 0 && (
                  <div className="self-start max-w-[95%] w-full space-y-2 mt-1">
                    {m.results.map((r) => (
                      <ResultCard key={r._id} item={r} />
                    ))}
                  </div>
                )}
              </React.Fragment>
            ))}
            {loading && <TypingDots />}
          </div>

          {messages.length <= 1 && !loading && (
            <div className="px-3 pb-2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="text-xs px-2 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-brand-blue hover:text-brand-blue transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={onSubmit} className="border-t p-2 flex items-end gap-2">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Describe what you lost or found…"
              className="flex-1 resize-none rounded-lg border border-gray-200 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue px-3 py-2 text-sm outline-none max-h-32"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-brand-blue disabled:opacity-50 hover:bg-brand-blue-dark text-white rounded-lg px-3 py-2 text-sm font-semibold transition"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiAssistant;
