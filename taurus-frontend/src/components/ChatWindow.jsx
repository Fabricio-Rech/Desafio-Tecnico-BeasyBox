import React, { useEffect, useState, useRef } from "react";

const ChatWindow = () => {
  const userId = "usuario123";
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [conversationId, setConversationId] = useState(() => crypto.randomUUID());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef(null); // <- âncora para scroll automático

  const fetchHistory = async (id = conversationId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/chat/history/${userId}/${id}`);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/chat/conversations/${userId}`);
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error("Erro ao buscar conversas:", err);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, userId, conversationId }),
      });
      const data = await res.json();
      setMessage("");
      fetchHistory();
      fetchConversations(); // <- atualiza os títulos após o envio
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
    }
  };

  const startNewConversation = () => {
    const newId = crypto.randomUUID();
    setConversationId(newId);
    setHistory([]);
    setMessage("");
  };

  const handleSelectConversation = (id) => {
    setConversationId(id);
    fetchHistory(id);
    setSidebarOpen(false);
  };

  useEffect(() => {
    fetchHistory();
    fetchConversations();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" }); // scroll automático
  }, [history]);

  return (
    <div className="flex h-screen">
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <div
        className={`${sidebarOpen ? "block" : "hidden"} md:block w-64 bg-gray-800 text-white p-4 flex flex-col fixed md:relative h-full z-40`}
      >
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded mb-4"
          onClick={startNewConversation}
        >
          Nova Conversa
        </button>
        <h2 className="text-lg font-bold mb-2">Conversas</h2>
        <ul className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              onClick={() => handleSelectConversation(conv.id)}
              className={`cursor-pointer p-2 rounded mb-1 ${
                conv.id === conversationId ? "bg-blue-500" : "hover:bg-gray-700"
              }`}
            >
              {conv.title || "Sem título"}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex-1 p-6 overflow-y-auto ml-0 md:ml-64">
        <h1 className="text-xl font-bold mb-4">Chat Taurus IA</h1>

        <div className="bg-gray-100 p-4 rounded mb-4 max-h-60 overflow-y-auto">
          <h2 className="font-semibold mb-2">Histórico</h2>
          {history.length === 0 ? (
            <p>Nenhuma conversa registrada.</p>
          ) : (
            <ul>
              {history.map((item, index) => (
                <li key={index} className="mb-3 border-b pb-2">
                  <div><strong>Você:</strong> {item.message}</div>
                  <div><strong>Bot:</strong> {item.response}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleString("pt-BR")}
                  </div>
                </li>
              ))}
              <div ref={bottomRef} />
            </ul>
          )}
        </div>

        <div className="flex gap-2">
          <input
            className="border p-2 flex-1"
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2 rounded">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
