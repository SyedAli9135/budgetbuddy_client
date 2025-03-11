"use client";

import { useEffect, useState } from "react";
import { FaPaperPlane, FaHistory, FaSignOutAlt, FaPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Message {
  id: number;
  role: "user" | "ai"; // Add role to match the frontend expectation
  question_text?: string; // Optional field for user questions
  content: string; // Use content for AI responses
  created_at: string;
}

interface Chat {
  chat_id: number;
  created_at: string;
  responses: Message[];
}

export default function HomePage() {
  const [input, setInput] = useState("");
  const [chats, setChats] = useState<Chat[]>([]); // Initialize as an empty array
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const cleanResponse = (text: string) => {
    return text
      .replace(/data:\s*<think>/g, "")
      .replace(/data:\s*<\/think>/g, "")
      .replace(/^data:\s*/gm, "")
      .trim();
  };

  const createChat = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch("https://1f92-39-46-184-235.ngrok-free.app/server/chats", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      fetchChats();
      alert("New Chat created successfully");
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedChat) return; // Ensure a chat is selected

    const tempId = Date.now();

    const newMessages: Message[] = [
      ...messages,
      {
        id: tempId,
        role: "ai",
        question_text: input, // Store the user's question
        content: "", // No content for user messages
        created_at: new Date().toISOString(),
      },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("You are not authenticated!");
      return;
    }

    try {
      const response = await fetch("https://1f92-39-46-184-235.ngrok-free.app/server/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: input,
          chat_id: selectedChat.chat_id, // Include the chat_id
        }),
      });

      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiMessage = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        aiMessage += cleanResponse(chunk);

        const temp = [...newMessages]
        temp[temp.length-1] = { ...temp[temp.length-1], content: aiMessage }
        setMessages(temp)
      
        // setMessages((prevMessages) => [
        //   ...prevMessages.filter((msg) => msg.role !== "ai"),
        //   {
        //     id: Date.now(),
        //     role: "ai",
        //     content: aiMessage.trim(), // Store the AI's response
        //     created_at: new Date().toISOString(),
        //   },
        // ]);
      }
    } catch (error) {
      console.error("Error streaming response:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChats = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch("https://1f92-39-46-184-235.ngrok-free.app/server/chats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        // Map backend responses to the frontend Message format
        const formattedChats = data.map((chat) => ({
          ...chat,
          responses: chat.responses.map((response: any) => ({
            id: response.id,
            role: response.response_text.startsWith("User:") ? "user" : "ai", // Determine role based on response_text
            question_text: response.question_text, // Include question_text
            content: response.response_text, // Include response_text
            created_at: response.created_at,
          })),
        }));

        setChats(formattedChats);
        if (formattedChats.length > 0) {
          setSelectedChat(formattedChats[0]);
          setMessages(formattedChats[0].responses);
        }
      } else {
        console.error("API response is not an array:", data);
        setChats([]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChats([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setMessages([]);
    router.push("/login");
  };

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-black to-[#4a0d85] text-white">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-gray-800 p-4 shadow-lg">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center">
          <Image src="/logo.png" alt="Logo" width={120} height={120} />
        </div>
        <button
          onClick={createChat}
          className="mt-2 flex items-center justify-center rounded-sm bg-black p-2 text-xs font-medium text-white transition hover:bg-gray-900"
        >
          <FaPlus className="mr-1 text-xs" /> Create
        </button>
        <h2 className="mb-4 mt-5 text-lg font-bold text-white">Chat History</h2>
        <ul className="flex-1 space-y-2 overflow-y-auto">
          {!Array.isArray(chats) || chats.length === 0 ? ( // Check if chats is an array and has items
            <p className="text-sm text-gray-300">No history yet</p>
          ) : (
            chats.map((chat) => (
              <li
                key={chat.chat_id}
                onClick={() => {
                  setSelectedChat(chat);
                  setMessages(chat.responses);
                }}
                className={`cursor-pointer rounded p-2 text-sm text-gray-200 hover:bg-[#3b2f8f] ${
                  selectedChat?.chat_id === chat.chat_id
                    ? "bg-[#25236a]"
                    : "bg-transparent"
                }`}
              >
                <FaHistory className="mr-2 inline-block" /> Chat #{chat.chat_id}
              </li>
            ))
          )}
        </ul>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-4 flex items-center justify-center rounded-lg bg-black p-3 text-sm font-semibold text-white transition hover:bg-gray-900"
        >
          <FaSignOutAlt className="mr-2" /> Logout
        </button>
      </aside>

      {/* Chat Area */}
      <main className="flex flex-1 flex-col justify-between p-6">
        {/* Messages */}
        <div className="flex flex-col space-y-4 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg.id} className="w-full flex flex-col gap-2">
              {msg.question_text ? <div className="w-fit max-w-lg rounded-lg p-3 self-end bg-[#4a0d85]">
                <div>
                    <p className="font-semibold">You:</p>
                    <p>{msg.question_text}</p>
                  </div>
              </div> : <></>}
              {msg.content ? <div
                key={msg.id} // Use msg.id instead of index
                className={`w-fit max-w-lg rounded-lg p-3 ${
                  msg.role === "user"
                    ? "self-end bg-[#4a0d85]"
                    : "self-start bg-[#4a0d85]"
                }`}
              >
                <div>
                    <p className="font-semibold">AI:</p>
                    <p>{msg.content}</p>
                  </div>
              </div> : <></>}
            </div>
          ))}
          {isLoading && (
            <div className="w-fit max-w-lg rounded-lg p-3 self-start bg-gray-700 animate-pulse">
              AI is typing...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="mt-4 flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 rounded-l-lg border border-gray-700 bg-[#4a0d85] p-3 text-white placeholder-gray-300 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="rounded-r-lg bg-black px-4 text-white transition hover:bg-gray-900"
            disabled={isLoading}
          >
            <FaPaperPlane />
          </button>
        </div>
      </main>
    </div>
  );
}
