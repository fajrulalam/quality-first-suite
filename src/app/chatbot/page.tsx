"use client";

import Link from "next/link";
import Image from "next/image";
import { useChatbot } from "../../hooks/useChatbot";
import { FormattedContent } from "./components/FormattedContent";
import { ModeToggle } from "./components/ModeToggle";

export default function ChatbotPage() {
  const {
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
  } = useChatbot();

  return (
    <>
      {/* Navigation Bar */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Image
                  src="/tiketcom logo.png"
                  alt="Tiket.com Logo"
                  width={120}
                  height={40}
                  priority
                />
              </div>
              <div className="ml-4 text-gray-600 font-medium hidden md:block">
                Tiket.com Quality First
              </div>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                Failure Analysis
              </Link>
              <Link
                href="/chatbot"
                className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                SQA Chatbot
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md flex flex-col h-[85vh]">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">SQA Chatbot</h1>
                <p className="text-sm text-gray-500">
                  Created by SQA Tiket.com. Coming soon.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => exportConversation("txt")}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  disabled={messages.length === 0}
                >
                  Export TXT
                </button>
                <button
                  onClick={() => exportConversation("rtf")}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  disabled={messages.length === 0}
                >
                  Export RTF
                </button>
                <button
                  onClick={clearConversation}
                  className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
                  disabled={messages.length === 0}
                >
                  Clear Chat
                </button>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-blue-500 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <h2 className="text-xl font-semibold mb-2">
                  Welcome to SQA Chatbot!
                </h2>
                <p className="text-gray-600 max-w-lg mx-auto">
                  Ask me anything.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-4xl px-4 py-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-50 text-gray-800 border border-gray-200"
                  }`}
                >
                  {message.mode === "testcase" && message.role === "user" && (
                    <div className="text-xs bg-blue-600 text-white px-2 py-1 rounded mb-2 inline-block">
                      Test Case Mode
                    </div>
                  )}
                  {message.role === "user" ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      <FormattedContent content={message.content} />
                    </div>
                  )}


                  {/* Enhanced source information */}
                  {message.sourceDocuments &&
                    message.sourceDocuments.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-300">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                          📚 Sources ({message.sourceDocuments.length}):
                        </div>
                        <div className="space-y-1">
                          {message.sourceDocuments.map((doc, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs"
                            >
                              <a
                                href={doc.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline flex-1 mr-2"
                              >
                                {doc.title}
                              </a>
                              <div className="flex items-center space-x-2 text-gray-500">
                                <span>{doc.space}</span>
                                {doc.relevanceScore && (
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      doc.relevanceScore >= 8
                                        ? "bg-green-100 text-green-700"
                                        : doc.relevanceScore >= 6
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-600"
                                    }`}
                                  >
                                    {doc.relevanceScore}/10
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>


                        {/* Search details */}
                        {message.searchDetails && (
                          <div className="mt-2 text-xs text-gray-500">
                            🔍 Searched {message.searchDetails.totalPagesFound}{" "}
                            pages, used {message.searchDetails.pagesUsed} pages,
                            {message.searchDetails.tokensUsed} tokens
                          </div>
                        )}
                      </div>
                    )}

                  <div className="text-xs opacity-70 mt-2">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}


            {/* Process Steps Visualization */}
            {isLoading && showProcessDetails && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-3">
                  Processing your request...
                </h3>
                <div className="space-y-2">
                  {currentProcessSteps.map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          step.status === "completed"
                            ? "bg-green-500"
                            : step.status === "error"
                            ? "bg-red-500"
                            : "bg-blue-500 animate-pulse"
                        }`}
                      >
                        {step.status === "completed" && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{step.step}</div>
                        {step.details && (
                          <div className="text-xs text-gray-600">
                            {step.details}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-200">
            <ModeToggle mode={chatMode} onChange={setChatMode} />
            <div className="flex space-x-4 mt-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={chatMode === "qa" 
                  ? "Ask me about QA processes, defect handling, testing procedures..." 
                  : "Describe a feature or scenario to generate test cases..."}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
