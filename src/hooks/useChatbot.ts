"use client";

import { useState, useRef, useEffect } from "react";

export interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  processSteps?: ProcessStep[];
  sourceDocuments?: {
    title: string;
    url: string;
    space: string;
    relevanceScore?: number;
  }[];
  searchDetails?: {
    totalPagesFound: number;
    pagesUsed: number;
    tokensUsed: number;
  };
  mode?: "qa" | "testcase";
}

export interface ProcessStep {
  step: string;
  status: "running" | "completed" | "error";
  details?: string;
}

export const useChatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentProcessSteps, setCurrentProcessSteps] = useState<ProcessStep[]>([]);
  const [showProcessDetails, setShowProcessDetails] = useState(false);
  const [chatMode, setChatMode] = useState<"qa" | "testcase">("qa");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentProcessSteps]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: inputMessage,
      timestamp: new Date().toISOString(),
      mode: chatMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setCurrentProcessSteps([]);
    setShowProcessDetails(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages.slice(-6), // Keep last 6 messages for context
          mode: chatMode
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
        processSteps: data.processSteps,
        sourceDocuments: data.sourceDocuments,
        searchDetails: data.searchDetails,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentProcessSteps(data.processSteps || []);

      // Hide process details after 3 seconds
      setTimeout(() => {
        setShowProcessDetails(false);
      }, 3000);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exportConversation = (format: "txt" | "rtf") => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `sqa-chat-${timestamp}.${format}`;

    let content = `SQA Chatbot Conversation Export\nDate: ${new Date().toLocaleString()}\n\n`;

    messages.forEach((msg) => {
      content += `${msg.role.toUpperCase()}: ${msg.content}\n`;
      if (msg.sourceDocuments && msg.sourceDocuments.length > 0) {
        content += `Sources:\n`;
        msg.sourceDocuments.forEach((doc) => {
          content += `- ${doc.title} (${doc.space}) - Relevance: ${doc.relevanceScore}/10\n`;
        });
      }
      if (msg.searchDetails) {
        content += `Search Details: Found ${msg.searchDetails.totalPagesFound} pages, used ${msg.searchDetails.pagesUsed} pages, ${msg.searchDetails.tokensUsed} tokens\n`;
      }
      content += `Time: ${new Date(msg.timestamp).toLocaleString()}\n\n`;
    });

    if (format === "rtf") {
      // A very basic RTF conversion
      content = content
        .replace(/\n/g, "\\par ")
        .replace(/\{/g, "\\{")
        .replace(/\}/g, "\\}");
      content = `{\\rtf1\\ansi\\deff0 {${content}}}`;
    }

    const blob = new Blob([content], {
      type: format === "rtf" ? "application/rtf" : "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearConversation = () => {
    setMessages([]);
    setCurrentProcessSteps([]);
  };

  return {
    messages,
    inputMessage,
    isLoading,
    currentProcessSteps,
    showProcessDetails,
    chatMode,
    messagesEndRef,
    setInputMessage,
    setChatMode,
    sendMessage,
    handleKeyPress,
    exportConversation,
    clearConversation,
  };
};
