import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { Send, Heart, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ChatroomModuleProps {
  onBackToApp?: () => void;
}

export default function ChatroomModule({ onBackToApp }: ChatroomModuleProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement>(null);

  // Determine early morning/afternoon/night greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    let timeGreeting = "晚安";
    if (hours >= 5 && hours < 11) {
      timeGreeting = "早安";
    } else if (hours >= 11 && hours < 18) {
      timeGreeting = "午安";
    }
    return `您好，${timeGreeting}，請問今天想跟我分享什麼事情呢😊`;
  };

  // Initialize with proactive care message
  useEffect(() => {
    const greetingMsg: ChatMessage = {
      id: 'greeting_proactive',
      sender: 'assistant',
      text: getGreeting(),
      timestamp: new Date(),
    };
    setMessages([greetingMsg]);
  }, []);

  // Handle auto-scroll
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    setErrorStatus(null);
    const userText = inputValue;
    setInputValue('');

    // Append User Message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      sender: 'user',
      text: userText,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      // Format messages into stateless API structures
      // role matches: 'user' or 'model'
      const apiHistory = updatedMessages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: apiHistory }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server error');
      }

      const data = await response.json();
      
      // Append Model Message
      const botMsg: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error("Failed to connect with chat server:", err);
      setErrorStatus(err.message || '無法連線到關懷伺服器。');
    } finally {
      setIsTyping(false);
    }
  };

  // Quick reply bubbles for easy elderly usage
  const quickReplies = [
    "今天心情不太好 😔",
    "剛剛出門散步很有精神 👵",
    "想聊聊以前有趣的事 🌸",
    "身體有點痠痛，不太對勁 🩹",
    "吃完中餐了，準備睡午覺 💤"
  ];

  const handleQuickReplyClick = (reply: string) => {
    if (isTyping) return;
    setInputValue(reply);
  };

  const handleResetChat = () => {
    const greetingMsg: ChatMessage = {
      id: `greeting_reset_${Date.now()}`,
      sender: 'assistant',
      text: getGreeting(),
      timestamp: new Date(),
    };
    setMessages([greetingMsg]);
    setErrorStatus(null);
  };

  return (
    <div className="bg-white rounded-[40px] p-6 border border-[#e5e4de] shadow-inner flex flex-col h-[580px]" id="chatroom-card">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#f5f5f0] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
            AI
          </div>
          <div>
            <h2 className="text-base font-serif font-bold text-[#3d3d2e]">AI 關懷助理</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-600 rounded-full inline-block animate-pulse" />
              <span className="text-[#8e8d82] text-[10px] uppercase font-bold tracking-wider">連線中</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="chat-reset-btn"
            onClick={handleResetChat}
            title="清空重置對話"
            className="p-2 border border-[#e5e4de] text-[#8e8d82] hover:text-[#5A5A40] hover:bg-[#f5f5f0] rounded-full transition cursor-pointer"
          >
            <RotateCcw size={15} />
          </button>
          {onBackToApp && (
            <button
              type="button"
              id="chat-back-to-panel"
              onClick={onBackToApp}
              className="text-xs font-semibold bg-[#f5f5f0] hover:bg-[#e5e4de] text-[#5A5A40] transition px-4 py-2 rounded-full cursor-pointer border border-[#e5e4de]/60"
            >
              返回主控台
            </button>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-1 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-[#e5e4de] scrollbar-track-transparent">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar */}
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                    助
                  </div>
                )}

                {/* Text Bubble */}
                <div
                  className={`p-4 rounded-2xl text-[15px] leading-relaxed ${
                    isUser
                      ? 'bg-[#5A5A40] text-white rounded-tr-none font-medium'
                      : 'bg-[#f5f5f0] text-[#2c2c2c] border border-[#e5e4de] rounded-tl-none font-sans'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <p className={`text-[9px] mt-1.5 text-right font-mono ${isUser ? 'text-white/60' : 'text-[#8e8d82]'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-[#5A5A40] text-white flex items-center justify-center font-bold text-xs shrink-0 animate-pulse">
              助
            </div>
            <div className="p-4 bg-[#f5f5f0] text-[#8e8d82] border border-[#e5e4de] rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5 font-medium animate-pulse">
              <Loader2 size={13} className="animate-spin" />
              <span>關懷秘書正在傾聽並寫字中...</span>
            </div>
          </div>
        )}

        {errorStatus && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl text-xs flex flex-col gap-2 max-w-sm mx-auto shadow-sm">
            <div className="flex items-start gap-2">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-rose-500" />
              <div>
                <span className="font-bold">連線對話異常</span>
                <p className="text-[11px] text-rose-600/90 mt-0.5">{errorStatus}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetChat}
              className="text-center w-full py-1.5 bg-rose-600 text-white font-bold rounded-full hover:bg-rose-700 transition cursor-pointer"
            >
              重置對話連線
            </button>
          </div>
        )}

        <div ref={listEndRef} />
      </div>

      {/* Recommended Suggestion Prompts for Seniors */}
      {messages.length < 5 && !isTyping && (
        <div className="mt-3">
          <span className="text-[10px] text-[#8e8d82] block font-bold uppercase tracking-wider mb-1">💡 點一下快速貼心詢問：</span>
          <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto">
            {quickReplies.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickReplyClick(r)}
                className="py-1 px-3 bg-[#f5f5f0] hover:bg-[#e5e4de] border border-[#e5e4de] text-[#2c2c2c] rounded-full text-xs font-semibold cursor-pointer transition-colors"
                style={{ contentVisibility: 'auto' }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 border-t border-[#f5f5f0] pt-3">
        <input
          type="text"
          id="chat-message-input"
          placeholder="請在這裡輸入想說的話..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isTyping}
          className="flex-1 px-5 py-3 bg-[#fdfcf8] border border-[#e5e4de] rounded-full focus:outline-none focus:border-[#5A5A40] focus:bg-white text-sm text-[#2c2c2c] transition-all font-sans"
        />
        <button
          type="submit"
          id="chat-send-btn"
          disabled={!inputValue.trim() || isTyping}
          className={`w-12 h-12 rounded-full font-bold transition-all flex items-center justify-center cursor-pointer shrink-0 ${
            inputValue.trim() && !isTyping
              ? 'bg-[#5A5A40] hover:bg-[#4a4a35] text-white shadow-sm'
              : 'bg-[#f5f5f0] text-[#8e8d82] border border-[#e5e4de] cursor-not-allowed'
          }`}
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
