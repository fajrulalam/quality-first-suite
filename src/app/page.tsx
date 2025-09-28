"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

// Import types and utility functions
import { TestData } from "@/utils/types";
import {
  processGeneralFile,
  processFirstRunFile,
  processSecondRunFile,
  processApiFile,
} from "@/utils/fileProcessor";
import { parseCSVForPreview } from "@/utils/dataProcessor";
import { getPassedInClass } from "@/utils/uiHelpers";
import { createWorker } from "@/utils/worker";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { orderTestCases } from "../utils/orderingUtils";

export default function Home() {
  // Analysis mode selection
  const [analysisMode, setAnalysisMode] = useState<
    "general" | "regression" | "api"
  >("general");

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // File and data state
  const [csvData, setCsvData] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState("");

  // Regression analysis specific state
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_firstRunFile, setFirstRunFile] = useState<File | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_secondRunFile, setSecondRunFile] = useState<File | null>(null);
  const [firstRunProcessed, setFirstRunProcessed] = useState(false);
  const [firstRunData, setFirstRunData] = useState<TestData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_secondRunData, setSecondRunData] = useState<TestData[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_combinedData, setCombinedData] = useState<TestData[]>([]);
  const [testCaseOrder, setTestCaseOrder] = useState<string>("");
  const [matchOrderExactly, setMatchOrderExactly] = useState<boolean>(false);

  // Worker reference
  const workerRef = useRef<Worker | null>(null);

  // Initialize the worker when needed
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _getWorker = () => {
    if (!workerRef.current && typeof window !== "undefined") {
      workerRef.current = createWorker();
    }
    return workerRef.current;
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const truncateCellContent = (
    text: string | null | undefined,
    maxLength: number = 80
  ): string => {
    if (!text) return "";
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  // Main process file function that delegates to the appropriate handler
  const processFile = (file: File) => {
    if (analysisMode === "general") {
      processGeneralFile(file, {
        setIsProcessing,
        setProgress,
        setCsvData,
        setFileName,
        setShowPreview,
        setDragActive,
      });
    } else if (analysisMode === "regression") {
      if (!firstRunProcessed) {
        processFirstRunFile(file, {
          setFirstRunFile,
          setIsProcessing,
          setProgress,
          setFirstRunData,
          setFirstRunProcessed,
          setDragActive,
        });
      } else {
        processSecondRunFile(file, firstRunData, {
          setSecondRunFile,
          setIsProcessing,
          setProgress,
          setSecondRunData,
          setCombinedData,
          setCsvData,
          setFileName,
          setShowPreview,
          setDragActive,
          testCaseOrder,
          matchOrderExactly,
        });
      }
    } else if (analysisMode === "api") {
      // Process API file
      processApiFile(file, {
        setIsProcessing,
        setProgress,
        setCsvData,
        setFileName,
        setShowPreview,
        setDragActive,
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDownloadCsv = () => {
    // Create and download CSV file
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyToClipboard = () => {
    if (!csvData) {
      alert("No data available to copy.");
      return;
    }

    // Convert commas to semicolons for clipboard copy
    const semicolonSeparatedData = csvData.replace(/,/g, ";");

    navigator.clipboard.writeText(semicolonSeparatedData).then(
      () => {
        setCopySuccess("Copied to clipboard with semicolons!");
        setTimeout(() => setCopySuccess(""), 2000);
      },
      () => {
        setCopySuccess("Failed to copy.");
        setTimeout(() => setCopySuccess(""), 2000);
      }
    );
  };

  const handleGoBack = () => {
    setShowPreview(false);
    setCsvData("");
    setFileName("");

    // If in regression mode, also reset the regression state
    if (analysisMode === "regression") {
      setFirstRunProcessed(false);
      setFirstRunFile(null);
      setSecondRunFile(null);
      setFirstRunData([]);
      setSecondRunData([]);
      setCombinedData([]);
      setTestCaseOrder("");
      setMatchOrderExactly(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: #0066ff;
          --secondary: #ff6b35;
          --accent: #00d4ff;
          --dark: #0a0a0a;
          --light: #ffffff;
          --glass-bg: rgba(255, 255, 255, 0.08);
          --glass-border: rgba(255, 255, 255, 0.12);
          --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          --brutal-shadow: 8px 8px 0px rgba(0, 0, 0, 0.8);
          --text-primary: #ffffff;
          --text-secondary: rgba(255, 255, 255, 0.8);
          --text-muted: rgba(255, 255, 255, 0.6);
        }
        
        * {
          box-sizing: border-box;
        }
        
        body {
          font-family: "JetBrains Mono", "SF Mono", "Monaco", "Inconsolata", "Fira Code", "Droid Sans Mono", monospace;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          background-attachment: fixed;
          color: var(--text-primary);
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 107, 53, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(0, 212, 255, 0.2) 0%, transparent 50%);
          pointer-events: none;
          z-index: -1;
        }
        
        .glass-morphism {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          box-shadow: var(--glass-shadow);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-morphism:hover {
          background: rgba(255, 255, 255, 0.12);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
          transform: translateY(-4px);
        }
        
        .brutal-card {
          background: var(--light);
          border: 4px solid var(--dark);
          border-radius: 0;
          box-shadow: var(--brutal-shadow);
          color: var(--dark);
          transition: all 0.2s ease;
        }
        
        .brutal-card:hover {
          transform: translate(-4px, -4px);
          box-shadow: 12px 12px 0px rgba(0, 0, 0, 0.8);
        }
        
        .brutal-btn {
          background: var(--primary);
          border: 3px solid var(--dark);
          border-radius: 0;
          color: var(--light);
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 16px 32px;
          box-shadow: 4px 4px 0px var(--dark);
          transition: all 0.15s ease;
          cursor: pointer;
          font-family: inherit;
        }
        
        .brutal-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px var(--dark);
        }
        
        .brutal-btn:active {
          transform: translate(0px, 0px);
          box-shadow: 2px 2px 0px var(--dark);
        }
        
        .brutal-btn.secondary {
          background: var(--secondary);
        }
        
        .brutal-btn.accent {
          background: var(--accent);
          color: var(--dark);
        }
        
        .neon-text {
          text-shadow: 
            0 0 5px currentColor,
            0 0 10px currentColor,
            0 0 15px currentColor,
            0 0 20px currentColor;
        }
        
        .grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .floating {
          animation: float 3s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 102, 255, 0.5); }
          50% { box-shadow: 0 0 40px rgba(0, 102, 255, 0.8); }
        }
        
        .pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        
        .shimmer-progress {
          position: relative;
          overflow: hidden;
          background-color: rgba(255, 255, 255, 0.1);
        }
        
        .shimmer-progress::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shimmer 1.5s infinite linear;
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--primary);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--accent);
        }
      `}</style>

      {/* Header Section */}
      <header className="sticky top-0 z-50 glass-morphism mx-4 mt-4 rounded-3xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <div className="relative">
                <Image
                  src="/tiketcom logo.png"
                  alt="Tiket.com Logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto brightness-0 invert"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-80 mix-blend-multiply rounded"></div>
              </div>
              <span className="ml-4 text-xl font-black text-white tracking-tight">
                QA<span className="text-cyan-400">SUITE</span>
              </span>
            </div>
            <nav className="hidden lg:flex items-center space-x-2">
              <Link
                href="/test-data"
                className="px-4 py-2 text-sm font-bold text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-xl"
              >
                TEST_DATA
              </Link>
              <Link
                href="/api-test-cases"
                className="px-4 py-2 text-sm font-bold text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-xl"
              >
                API_CASES
              </Link>
              <Link
                href="/chatbot"
                className="px-4 py-2 text-sm font-bold text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-xl"
              >
                AI_CHAT
              </Link>
              <Link
                href="/test-runs"
                className="px-4 py-2 text-sm font-bold text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/10 rounded-xl"
              >
                DOCUMENTOR
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 grid-pattern">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="text-[20rem] font-black text-white select-none">QA</div>
            </div>
            <div className="relative z-10">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8">
                <span className="block text-white neon-text">AUTOMATED</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  FAILURE
                </span>
                <span className="block text-white">ANALYSIS</span>
              </h1>
              <div className="max-w-3xl mx-auto mb-8">
                <p className="text-xl md:text-2xl text-white/80 font-mono leading-relaxed">
                  {'>'} EXTRACT_DATA(reports.html)<br/>
                  {'>'} ANALYZE_FAILURES()<br/>
                  {'>'} OPTIMIZE_TESTING()
                </p>
              </div>
              <div className="text-sm text-white/60 font-mono">
                [DEVELOPED_BY: ACCOM_SQA_TEAM]
              </div>
            </div>
          </div>

          {!showPreview && (
            <div className="space-y-8">
              {/* Action Grid */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Link href="/api-test-cases" className="group">
                  <div className="brutal-card p-6 h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-green-500 border-4 border-black flex items-center justify-center">
                        <span className="text-2xl font-black text-white">API</span>
                      </div>
                      <h3 className="text-lg font-black mb-2 uppercase tracking-wide">
                        API TEST CASES
                      </h3>
                      <p className="text-sm font-mono text-gray-600">
                        GENERATE_SYSTEMATIC_API_TESTS()
                      </p>
                    </div>
                  </div>
                </Link>

                <Link href="/test-data" className="group">
                  <div className="brutal-card p-6 h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 border-4 border-black flex items-center justify-center">
                        <span className="text-2xl font-black text-white">DATA</span>
                      </div>
                      <h3 className="text-lg font-black mb-2 uppercase tracking-wide">
                        TEST DATA
                      </h3>
                      <p className="text-sm font-mono text-gray-600">
                        CREATE_AUTOMATED_SEQUENCES()
                      </p>
                    </div>
                  </div>
                </Link>

                <Link href="/chatbot" className="group">
                  <div className="brutal-card p-6 h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500 border-4 border-black flex items-center justify-center">
                        <span className="text-2xl font-black text-black">AI</span>
                      </div>
                      <h3 className="text-lg font-black mb-2 uppercase tracking-wide">
                        AI ASSISTANT
                      </h3>
                      <p className="text-sm font-mono text-gray-600">
                        CHAT_WITH_INTELLIGENT_SQA()
                      </p>
                    </div>
                  </div>
                </Link>

                <Link href="/test-runs" className="group">
                  <div className="brutal-card p-6 h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-purple-500 border-4 border-black flex items-center justify-center">
                        <span className="text-2xl font-black text-white">DOC</span>
                      </div>
                      <h3 className="text-lg font-black mb-2 uppercase tracking-wide">
                        DOCUMENTOR
                      </h3>
                      <p className="text-sm font-mono text-gray-600">
                        DOCUMENT_TEST_CASES()
                      </p>
                    </div>
                  </div>
                </Link>
              </section>

              {/* Feature Showcase */}
              <section className="glass-morphism p-8 mb-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-wider">
                    SYSTEM_FEATURES
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center floating">
                    <div className="w-20 h-20 mx-auto mb-4 glass-morphism rounded-full flex items-center justify-center pulse-glow">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">FAST_PROCESSING</h3>
                    <p className="text-white/70 font-mono text-sm">
                      Lightning-fast HTML report analysis with Web Workers
                    </p>
                  </div>
                  <div className="text-center floating" style={{animationDelay: '0.5s'}}>
                    <div className="w-20 h-20 mx-auto mb-4 glass-morphism rounded-full flex items-center justify-center pulse-glow">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">SMART_ANALYSIS</h3>
                    <p className="text-white/70 font-mono text-sm">
                      Intelligent failure pattern detection and categorization
                    </p>
                  </div>
                  <div className="text-center floating" style={{animationDelay: '1s'}}>
                    <div className="w-20 h-20 mx-auto mb-4 glass-morphism rounded-full flex items-center justify-center pulse-glow">
                      <span className="text-2xl">📊</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">DATA_EXPORT</h3>
                    <p className="text-white/70 font-mono text-sm">
                      Export to CSV, Excel, or copy to clipboard instantly
                    </p>
                  </div>
                </div>
              </section>

              {/* Analysis Mode Selection */}
              <section className="glass-morphism p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-wider">
                    SELECT_ANALYSIS_MODE
                  </h2>
                  <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(["general", "regression", "api"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setAnalysisMode(mode);
                        if (mode === "regression") {
                          setFirstRunProcessed(false);
                          setFirstRunFile(null);
                          setSecondRunFile(null);
                        }
                      }}
                      className={`brutal-btn w-full ${
                        analysisMode === mode
                          ? "bg-cyan-400 text-black"
                          : mode === "regression"
                          ? "secondary"
                          : mode === "api"
                          ? "accent"
                          : ""
                      }`}
                    >
                      {mode === "general"
                        ? "WEB_ANALYSIS"
                        : mode === "regression"
                        ? "REGRESSION_TEST"
                        : "API_ANALYSIS"}
                    </button>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-black/20 rounded-lg border border-white/10">
                  <p className="text-white/80 font-mono text-sm text-center">
                    {analysisMode === "general"
                      ? `${'>'}UPLOAD_SINGLE_HTML_REPORT()`
                      : analysisMode === "regression"
                      ? firstRunProcessed
                        ? `${'>'}UPLOAD_SECOND_RUN_REPORT()`
                        : `${'>'}UPLOAD_FIRST_RUN_REPORT()`
                      : `${'>'}UPLOAD_API_HTML_REPORT()`}
                  </p>
                </div>
              </section>

              {/* Test Case Ordering for Regression Analysis Card */}
              {analysisMode === "regression" && (
                <section
                  aria-labelledby="test-case-order-title"
                  className="glass-card"
                >
                  <h2
                    id="test-case-order-title"
                    className="text-xl font-semibold text-[var(--text-primary)] mb-4"
                  >
                    Custom Test Case Order (Regression Only)
                  </h2>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--tiket-blue)] focus:border-[var(--tiket-blue)] sm:text-sm bg-white/80 placeholder-gray-400 text-[var(--text-primary)]"
                    rows={5}
                    placeholder="Enter test name patterns, one per line (e.g., getMasterTagApiLogin, checkRecentlySearchedLogin)"
                    value={testCaseOrder}
                    onChange={(e) => setTestCaseOrder(e.target.value)}
                  />
                  <div className="mt-4 flex items-center">
                    <input
                      id="match-order-exactly"
                      type="checkbox"
                      checked={matchOrderExactly}
                      onChange={(e) => setMatchOrderExactly(e.target.checked)}
                      className="h-4 w-4 text-[var(--tiket-blue)] focus:ring-[var(--tiket-blue)] border-gray-300 rounded"
                    />
                    <label
                      htmlFor="match-order-exactly"
                      className="ml-2 block text-sm text-[var(--text-primary)]"
                    >
                      Match test names exactly (preserves order and duplicates)
                    </label>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {matchOrderExactly
                      ? "Tests will be ordered exactly as listed above. Tests not in the list will be appended alphabetically."
                      : "Define the order for test cases in the regression report. Patterns are matched sequentially."}
                  </p>
                </section>
              )}

              {/* File Upload Area Card */}
              <section
                aria-labelledby="file-upload-title"
                className="glass-card"
              >
                <h2
                  id="file-upload-title"
                  className="text-2xl font-semibold text-[var(--text-primary)] mb-6 text-center"
                >
                  {analysisMode === "regression"
                    ? firstRunProcessed
                      ? "Upload 2nd Run Report"
                      : "Upload 1st Run Report"
                    : "Upload Report"}
                </h2>
                <div
                  className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out 
                    ${
                      dragActive
                        ? "border-[var(--tiket-yellow)] bg-yellow-50/50 scale-105"
                        : "border-gray-300 hover:border-gray-400"
                    } 
                    ${
                      isProcessing
                        ? "opacity-60 pointer-events-none"
                        : "cursor-pointer hover:bg-gray-50/30"
                    }`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => {
                    if (!isProcessing) {
                      document.getElementById("file-upload")?.click();
                    }
                  }}
                >
                  {isProcessing ? (
                    <div className="text-center p-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--tiket-blue)] mx-auto mb-4"></div>
                      <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                        Processing your file...
                      </p>
                      <div className="w-full max-w-xs bg-gray-200 rounded-full h-3.5 mx-auto mb-2 shimmer-progress">
                        <div
                          className="bg-gradient-to-r from-[var(--tiket-yellow)] to-orange-400 h-3.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {analysisMode === "regression"
                          ? firstRunProcessed
                            ? "Analyzing 2nd run report..."
                            : "Analyzing 1st run report..."
                          : "Extracting data..."}
                        ({progress}%)
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg
                        className="mx-auto h-16 w-16 text-gray-400 mb-4"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-lg font-medium text-[var(--text-primary)] mb-1">
                        Drag & drop your HTML file here
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        or{" "}
                        <span className="font-semibold text-[var(--tiket-blue)]">
                          click to browse
                        </span>
                      </p>
                      <p className="mt-4 text-xs text-gray-400">
                        Supports .html files. Max 50MB.
                      </p>
                    </div>
                  )}
                  <input
                    id="file-upload"
                    type="file"
                    accept=".html"
                    className="hidden"
                    onChange={handleChange}
                    disabled={isProcessing}
                  />
                </div>

                <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
                  <p>Ensure your HTML report is from a trusted source.</p>
                  <p className="mt-1">
                    Large files with embedded images are processed efficiently
                    using Web Workers.
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* CSV Preview Card */}
          {showPreview && (
            <section
              aria-labelledby="csv-preview-title"
              className="glass-card w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h2
                  id="csv-preview-title"
                  className="text-3xl font-semibold text-[var(--text-primary)]"
                >
                  Analysis Preview:{" "}
                  <span className="text-[var(--tiket-blue)]">{fileName}</span>
                </h2>
                <div className="flex items-center">
                  <button
                    onClick={handleGoBack}
                    className="px-6 py-3 rounded-lg text-sm font-semibold border-2 border-[var(--tiket-blue)] text-[var(--tiket-blue)] bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-[var(--tiket-blue)] focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H15a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Go Back
                  </button>
                  <button
                    onClick={handleDownloadCsv}
                    className="ml-4 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[var(--tiket-blue)] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[var(--tiket-blue)] focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Download CSV
                  </button>
                  <button
                    onClick={handleCopyToClipboard}
                    className="ml-4 px-6 py-3 rounded-lg text-sm font-semibold text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    Copy to Clipboard
                  </button>
                  {copySuccess && (
                    <span className="ml-4 text-green-600 font-semibold">
                      {copySuccess}
                    </span>
                  )}
                </div>
              </div>
              <div className="overflow-auto max-h-[60vh] rounded-lg border border-gray-200 shadow-inner custom-scrollbar bg-white/70">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                    <tr>
                      {parseCSVForPreview(csvData).headers.map(
                        (header, index) => (
                          <th
                            key={index}
                            scope="col"
                            className="px-6 py-4 text-left text-xs font-bold text-[var(--tiket-blue)] uppercase tracking-wider whitespace-nowrap"
                          >
                            {header}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {parseCSVForPreview(csvData).rows.map((row, rowIndex) => {
                      const status = row[1];
                      const passedIn =
                        analysisMode === "regression" ? row[6] : "";
                      const passedInClass = getPassedInClass(passedIn);

                      return (
                        <tr
                          key={rowIndex}
                          className={`transition-colors duration-150 ${
                            rowIndex % 2 === 0 ? "bg-white/70" : "bg-blue-50/30"
                          } hover:bg-yellow-50/50`}
                        >
                          {row.map((cell, cellIndex) => {
                            let cellClass =
                              "px-6 py-4 text-sm text-[var(--text-secondary)] whitespace-nowrap";
                            if (cellIndex === 1) {
                              // Status column
                              if (analysisMode === "api") {
                                // API status colors: Skip (yellow), Pass (green), Failed (red)
                                cellClass = `px-6 py-4 text-sm font-semibold whitespace-nowrap ${
                                  status === "Skip"
                                    ? "text-amber-500" // Yellow for Skip
                                    : status === "Pass"
                                    ? "text-green-600" // Green for Pass
                                    : "text-red-600" // Red for Failed
                                }`;
                              } else {
                                // Original status colors for other modes
                                cellClass = `px-6 py-4 text-sm font-semibold whitespace-nowrap ${
                                  status === "FAIL"
                                    ? "text-red-600"
                                    : "text-green-600"
                                }`;
                              }
                            } else if (cellIndex === 2 || cellIndex === 4) {
                              // Session ID & Exception Message
                              cellClass =
                                "px-6 py-4 text-sm text-[var(--text-secondary)] font-mono whitespace-nowrap max-w-xs"; // Removed truncate
                            } else if (
                              analysisMode === "regression" &&
                              cellIndex === 6
                            ) {
                              // PassedIn column
                              cellClass = `px-6 py-4 text-sm font-semibold whitespace-nowrap ${passedInClass}`;
                            }

                            return (
                              <td
                                key={cellIndex}
                                className={cellClass}
                                title={cell || ""}
                              >
                                {cellIndex === 1 ? (
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      status === "FAIL"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {status === "FAIL" ? (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1.5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L10 8.586 7.707 6.293a1 1 0 00-1.414 1.414L8.586 10l-2.293 2.293a1 1 0 001.414 1.414L10 11.414l2.293 2.293a1 1 0 001.414-1.414L11.414 10l2.293-2.293z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    ) : (
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4 mr-1.5"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.293 8.879a1 1 0 10-1.414 1.414l2.5 2.5a1 1 0 001.414 0l4-4z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                    {truncateCellContent(cell)}
                                  </span>
                                ) : (
                                  truncateCellContent(cell)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {parseCSVForPreview(csvData).rows.length === 0 && (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-lg font-medium text-[var(--text-primary)]">
                      No data to display
                    </h3>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      The processed file appears to have no extractable test
                      data.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Footer Section */}
      <footer className="glass-morphism mx-4 mb-4 rounded-3xl">
        <div className="max-w-7xl mx-auto py-6 px-6 lg:px-8 text-center">
          <p className="text-sm font-mono text-white/60">
            &copy; {new Date().getFullYear()} DEVELOPED_BY_QA_ACCOMMODATION_TEAM
          </p>
        </div>
      </footer>
    </>
  );
}
