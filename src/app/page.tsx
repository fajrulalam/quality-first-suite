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
} from "@/utils/fileProcessor";
import { parseCSVForPreview } from "@/utils/dataProcessor";
import { getPassedInClass } from "@/utils/uiHelpers";
import { createWorker } from "@/utils/worker";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { orderTestCases } from "../utils/orderingUtils";

export default function Home() {
  // Analysis mode selection
  const [analysisMode, setAnalysisMode] = useState<"general" | "regression">(
    "general"
  );

  // UI state
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // File and data state
  const [csvData, setCsvData] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");

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
        });
      }
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
    }
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --tiket-blue: #0064d2; /* Tiket.com primary blue */
          --tiket-yellow: #ffc900; /* Tiket.com accent yellow */
          --tiket-light-blue: #e6f3ff; /* Lighter blue for backgrounds/accents */
          --glass-bg: rgba(255, 255, 255, 0.6);
          --glass-border: rgba(255, 255, 255, 0.3);
          --shadow-color: rgba(0, 0, 0, 0.1);
          --text-primary: #1a202c; /* Dark gray for primary text */
          --text-secondary: #4a5568; /* Medium gray for secondary text */
        }
        body {
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans",
            "Helvetica Neue", sans-serif;
          background-image: linear-gradient(
            to bottom,
            var(--tiket-light-blue),
            white 30%,
            #fff9e6 100%
          );
          color: var(--text-primary);
        }
        .glass-card {
          background: var(--glass-bg);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px); /* For Safari */
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 8px 32px 0 var(--shadow-color);
          padding: 2rem;
          transition: all 0.3s ease;
        }
        .glass-card:hover {
          box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
        }
        .shimmer-progress {
          position: relative;
          overflow: hidden;
          background-color: #e0e0e0; /* Base color of progress bar */
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
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--tiket-blue);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0052a8; /* Darker blue on hover */
        }
      `}</style>

      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Image
                src="/tiketcom logo.png"
                alt="Tiket.com Logo"
                width={120} // Adjust width as needed
                height={40} // Adjust height as needed
                className="h-10 w-auto"
              />
              <span className="ml-3 text-2xl font-bold text-[var(--tiket-blue)]">
                Quality First Automation Suite
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/chatbot"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-[var(--tiket-yellow)] hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Chat with AI Assistant ✨
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="min-h-[calc(100vh-10rem)] py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-5xl space-y-10">
          {/* Page Title and Subtitle */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl md:text-6xl">
              <span className="block">Automated</span>
              <span className="block text-[var(--tiket-blue)]">
                Failure Analysis
              </span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-[var(--text-secondary)]">
              Efficiently extract and analyze test report data. Upload your HTML
              reports to get started.
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Originally by Accom SQA: M Fajrul Alam U. N, Sunny Kumar, Amit
              Kumar Dwivedi
            </p>
          </div>

          {!showPreview && (
            <div className="space-y-8">
              {/* Analysis Mode Selection Card */}
              <section
                aria-labelledby="analysis-mode-title"
                className="glass-card"
              >
                <h2
                  id="analysis-mode-title"
                  className="text-2xl font-semibold text-[var(--text-primary)] mb-6 text-center"
                >
                  Select Analysis Mode
                </h2>
                <div className="flex justify-center space-x-3">
                  {(["general", "regression"] as const).map((mode) => (
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
                      className={`px-8 py-3.5 text-base font-medium rounded-xl border-2 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md 
                        ${
                          analysisMode === mode
                            ? "bg-[var(--tiket-blue)] text-white border-[var(--tiket-blue)] ring-[var(--tiket-blue)]"
                            : "bg-white text-[var(--tiket-blue)] border-gray-300 hover:bg-gray-50 hover:border-[var(--tiket-blue)] ring-[var(--tiket-blue)]"
                        }`}
                    >
                      {mode === "general"
                        ? "General Analysis"
                        : "Regression Analysis"}
                    </button>
                  ))}
                </div>
                <p className="text-center text-md text-[var(--text-secondary)] mt-6">
                  {analysisMode === "general"
                    ? "Upload a single HTML report for detailed test case extraction."
                    : firstRunProcessed
                    ? "Upload the 2nd run HTML report to compare with the 1st run."
                    : "Upload the 1st run HTML report, then the 2nd run for comparison."}
                </p>
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
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Define the order for test cases in the regression report.
                    Patterns are matched sequentially.
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
                <div className="flex space-x-3">
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
                    className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[var(--tiket-blue)] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[var(--tiket-blue)] focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
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
                              cellClass = `px-6 py-4 text-sm font-semibold whitespace-nowrap ${
                                status === "FAIL"
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`;
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
      <footer className="bg-white/50 border-t border-gray-200/80 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            &copy; {new Date().getFullYear()} Test Analysis Center. Enhanced by
            Your AI Pair Programmer.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Inspired by Tiket.com's design palette.
          </p>
        </div>
      </footer>
    </>
  );
}
