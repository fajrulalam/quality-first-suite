"use client";

import Link from "next/link";
import Image from "next/image";

export default function ChatbotPage() {
  return (
    <>
      {/* Navigation Bar with Product Tabs - Similar to Tiket.com */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Logo and Main Navigation */}
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

          {/* Product Category Tabs - Similar to Tiket.com */}
          {/* <div className="overflow-x-auto whitespace-nowrap px-2 pb-2">
            <div className="inline-flex space-x-1 min-w-full px-2">
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                <span className="mr-1">🚆</span> Test Report
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                <span className="mr-1">✈️</span> Flight
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                <span className="mr-1">🏨</span> Hotel
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                <span className="mr-1">🚂</span> Train
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                <span className="mr-1">🚌</span> Bus & Travel
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                <span className="mr-1">🚢</span> Ferry
              </div>
              <div className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                <span className="mr-1">🤖</span> SQA Chatbot
              </div>
              <div className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                <span className="mr-1">🧳</span> Activities
              </div>
            </div>
          </div> */}
        </div>
      </header>

      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-2">SQA Chatbot</h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Created by Accom SQA: M Fajrul Alam U. N, Sunny Kumar, Amit Kumar
            Dwivedi
          </p>

          <div className="flex items-center justify-center h-64">
            <div className="text-center">
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
              <h2 className="text-xl font-semibold mb-2">Coming Soon!</h2>
              <p className="text-gray-600">
                Our SQA Chatbot is currently under development.
                <br />
                Check back soon for intelligent test automation assistance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
