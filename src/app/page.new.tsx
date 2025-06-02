// "use client";

// import { useState, useRef } from "react";
// import Link from "next/link";
// import Image from "next/image";

// // Import types and utility functions
// import { TestData } from "@/utils/types";
// import {
//   processGeneralFile,
//   processFirstRunFile,
//   processSecondRunFile,
// } from "@/utils/fileProcessor";
// import { parseCSVForPreview } from "@/utils/dataProcessor";
// import { getPassedInClass } from "@/utils/uiHelpers";
// import { createWorker } from "@/utils/worker";

// export default function Home() {
//   // Analysis mode selection
//   const [analysisMode, setAnalysisMode] = useState<"general" | "regression">(
//     "general"
//   );

//   // UI state
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [dragActive, setDragActive] = useState(false);
//   const [progress, setProgress] = useState(0);
//   const [showPreview, setShowPreview] = useState(false);

//   // File and data state
//   const [csvData, setCsvData] = useState<string>("");
//   const [fileName, setFileName] = useState<string>("");

//   // Regression analysis specific state
//   const [firstRunFile, setFirstRunFile] = useState<File | null>(null);
//   const [secondRunFile, setSecondRunFile] = useState<File | null>(null);
//   const [firstRunProcessed, setFirstRunProcessed] = useState(false);
//   const [firstRunData, setFirstRunData] = useState<TestData[]>([]);
//   const [secondRunData, setSecondRunData] = useState<TestData[]>([]);
//   const [combinedData, setCombinedData] = useState<TestData[]>([]);

//   // Worker reference
//   const workerRef = useRef<Worker | null>(null);

//   // Initialize the worker when needed
//   const getWorker = () => {
//     if (!workerRef.current && typeof window !== "undefined") {
//       workerRef.current = createWorker();
//     }
//     return workerRef.current;
//   };

//   // Handle drag events
//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   };

//   // Main process file function that delegates to the appropriate handler
//   const processFile = (file: File) => {
//     if (analysisMode === "general") {
//       processGeneralFile(file, {
//         setIsProcessing,
//         setProgress,
//         setCsvData,
//         setFileName,
//         setShowPreview,
//         setDragActive,
//       });
//     } else if (analysisMode === "regression") {
//       if (!firstRunProcessed) {
//         processFirstRunFile(file, {
//           setFirstRunFile,
//           setIsProcessing,
//           setProgress,
//           setFirstRunData,
//           setFirstRunProcessed,
//           setDragActive,
//         });
//       } else {
//         processSecondRunFile(file, firstRunData, {
//           setSecondRunFile,
//           setIsProcessing,
//           setProgress,
//           setSecondRunData,
//           setCombinedData,
//           setCsvData,
//           setFileName,
//           setShowPreview,
//           setDragActive,
//         });
//       }
//     }
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);

//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       processFile(e.dataTransfer.files[0]);
//     }
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     e.preventDefault();

//     if (e.target.files && e.target.files[0]) {
//       processFile(e.target.files[0]);
//     }
//   };

//   const handleDownloadCsv = () => {
//     // Create and download CSV file
//     const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.setAttribute("href", url);
//     link.setAttribute("download", `${fileName}.csv`);
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleGoBack = () => {
//     setShowPreview(false);
//     setCsvData("");
//     setFileName("");

//     // If in regression mode, also reset the regression state
//     if (analysisMode === "regression") {
//       setFirstRunProcessed(false);
//       setFirstRunFile(null);
//       setSecondRunFile(null);
//       setFirstRunData([]);
//       setSecondRunData([]);
//       setCombinedData([]);
//     }
//   };

//   return (
//     <>
//       {/* Navigation Bar */}
//       <nav className="bg-white shadow">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 <Image
//                   src="/tiketcom logo.png"
//                   alt="Tiket.com Logo"
//                   width={120}
//                   height={40}
//                   priority
//                 />
//               </div>
//               <div className="ml-4 text-gray-600 font-medium">
//                 Tiket.com Quality First
//               </div>
//             </div>
//             <div className="flex space-x-4">
//               <Link
//                 href="/"
//                 className="px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-800"
//               >
//                 Failure Analysis
//               </Link>
//               <Link
//                 href="/chatbot"
//                 className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-800"
//               >
//                 SQA Chatbot
//               </Link>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Main Content */}
//       <div className="min-h-screen bg-gray-100 p-4">
//         <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
//           <h1 className="text-2xl font-bold text-center mb-2">
//             Failure Analysis - Extent Report Extractor
//           </h1>
//           <p className="text-center text-sm text-gray-500 mb-6">
//             Created by Accom SQA: M Fajrul Alam U. N, Sunny Kumar, Amit Kumar
//             Dwivedi
//           </p>

//           {!showPreview && (
//             <>
//               {/* Analysis Mode Selection */}
//               <div className="mb-6">
//                 <div className="flex justify-center">
//                   <div className="inline-flex rounded-md shadow-sm">
//                     <button
//                       onClick={() => setAnalysisMode("general")}
//                       className={`px-4 py-2 text-sm font-medium rounded-l-lg border ${
//                         analysisMode === "general"
//                           ? "bg-blue-600 text-white border-blue-600"
//                           : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                       }`}
//                     >
//                       General Failure Analysis
//                     </button>
//                     <button
//                       onClick={() => {
//                         setAnalysisMode("regression");
//                         setFirstRunProcessed(false);
//                         setFirstRunFile(null);
//                         setSecondRunFile(null);
//                       }}
//                       className={`px-4 py-2 text-sm font-medium rounded-r-lg border ${
//                         analysisMode === "regression"
//                           ? "bg-blue-600 text-white border-blue-600"
//                           : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
//                       }`}
//                     >
//                       App Regression Analysis
//                     </button>
//                   </div>
//                 </div>
//                 <p className="text-center text-sm text-gray-500 mt-2">
//                   {analysisMode === "general"
//                     ? "Upload a single HTML report to extract test case details"
//                     : firstRunProcessed
//                     ? "Now upload the 2nd run HTML report to compare with the 1st run"
//                     : "First upload the 1st run HTML report, then you'll upload the 2nd run report"}
//                 </p>
//               </div>

//               {/* File Upload Area */}
//               <div
//                 className={`border-2 border-dashed rounded-lg p-8 text-center ${
//                   dragActive
//                     ? "border-blue-500 bg-blue-50"
//                     : "border-gray-300 hover:border-gray-400"
//                 } ${
//                   isProcessing
//                     ? "opacity-50 pointer-events-none"
//                     : "cursor-pointer"
//                 }`}
//                 onDragEnter={handleDrag}
//                 onDragOver={handleDrag}
//                 onDragLeave={handleDrag}
//                 onDrop={handleDrop}
//                 onClick={() => {
//                   if (!isProcessing) {
//                     document.getElementById("file-upload")?.click();
//                   }
//                 }}
//               >
//                 {isProcessing ? (
//                   <div>
//                     <p className="text-lg mb-4">Processing file...</p>
//                     <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
//                       <div
//                         className="bg-blue-600 h-2.5 rounded-full"
//                         style={{ width: `${progress}%` }}
//                       ></div>
//                     </div>
//                     <p className="text-sm text-gray-500">
//                       {analysisMode === "regression"
//                         ? firstRunProcessed
//                           ? "Processing 2nd run file..."
//                           : "Processing 1st run file..."
//                         : "Processing file..."}
//                     </p>
//                   </div>
//                 ) : (
//                   <>
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="h-12 w-12 mx-auto text-gray-400 mb-4"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                       />
//                     </svg>
//                     <p className="text-lg mb-2">
//                       {analysisMode === "regression"
//                         ? firstRunProcessed
//                           ? "Drag and drop your 2nd run HTML file here"
//                           : "Drag and drop your 1st run HTML file here"
//                         : "Drag and drop your HTML file here"}
//                     </p>
//                     <p className="text-sm text-gray-500">
//                       or click to select a file
//                     </p>
//                   </>
//                 )}
//                 <input
//                   id="file-upload"
//                   type="file"
//                   accept=".html"
//                   className="hidden"
//                   onChange={handleChange}
//                   disabled={isProcessing}
//                 />
//               </div>

//               <div className="mt-8 text-center text-sm text-gray-500">
//                 <p>Upload an HTML file to convert it to CSV format.</p>
//                 <p className="mt-2">
//                   Large files with base64 images will be processed efficiently.
//                 </p>
//               </div>
//             </>
//           )}

//           {/* CSV Preview */}
//           {showPreview && (
//             <div className="mt-6">
//               <h2 className="text-xl font-semibold mb-4">CSV Preview</h2>
//               <div className="overflow-x-auto border rounded-lg">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       {parseCSVForPreview(csvData).headers.map(
//                         (header, index) => (
//                           <th
//                             key={index}
//                             className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
//                           >
//                             {header}
//                           </th>
//                         )
//                       )}
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {parseCSVForPreview(csvData).rows.map((row, rowIndex) => {
//                       // Extract values for styling
//                       const status = row[1]; // Assuming status is the 2nd column
//                       const sessionId = row[2]; // Assuming sessionId is the 3rd column
//                       const exceptionMessage = row[4]; // Assuming exceptionMessage is the 5th column
//                       const passedIn =
//                         analysisMode === "regression" ? row[6] : ""; // Assuming passedIn is the 7th column in regression mode
//                       const passedInClass = getPassedInClass(passedIn);

//                       return (
//                         <tr
//                           key={rowIndex}
//                           className={
//                             rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
//                           }
//                         >
//                           {row.map((cell, cellIndex) => {
//                             // Apply different styling based on column type
//                             let cellClass = "px-6 py-4 text-sm text-gray-500";

//                             // Status column
//                             if (cellIndex === 1) {
//                               cellClass = `px-6 py-4 text-sm font-medium ${
//                                 status === "FAIL"
//                                   ? "text-red-500"
//                                   : "text-green-500"
//                               }`;
//                             }
//                             // Session ID column
//                             else if (cellIndex === 2) {
//                               cellClass =
//                                 "px-6 py-4 text-sm text-gray-500 font-mono";
//                             }
//                             // Exception message column
//                             else if (cellIndex === 4) {
//                               cellClass =
//                                 "px-6 py-4 text-sm text-gray-500 font-mono";
//                             }
//                             // PassedIn column (regression mode only)
//                             else if (
//                               analysisMode === "regression" &&
//                               cellIndex === 6
//                             ) {
//                               cellClass = `px-6 py-4 text-sm ${passedInClass}`;
//                             }

//                             return (
//                               <td key={cellIndex} className={cellClass}>
//                                 {cell}
//                               </td>
//                             );
//                           })}
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//               <div className="px-4 py-4 sm:px-6 flex justify-between">
//                 <button
//                   onClick={handleGoBack}
//                   className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   Go Back
//                 </button>
//                 <button
//                   onClick={handleDownloadCsv}
//                   className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   Download CSV
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   );
// }
