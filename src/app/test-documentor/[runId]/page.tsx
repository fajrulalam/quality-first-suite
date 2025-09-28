"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

interface TestCase {
  id: string;
  testCase: string;
  status: "pass" | "failed" | "skip" | "retest";
  imageNames: string[];
  imagePasteTimestamp?: string;
}

interface LocalStorageData {
  testCases: TestCase[];
  saveFolder: string;
}

interface TestRun {
  id: string;
  name: string;
  createdAt: string;
  lastModified: string;
  testCaseCount: number;
}

interface TestRunsData {
  testRuns: TestRun[];
}

const statusColors = {
  pass: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  skip: "bg-yellow-100 text-yellow-800 border-yellow-200",
  retest: "bg-orange-100 text-orange-800 border-orange-200",
};

const statusOptions = [
  { value: "pass", label: "Pass" },
  { value: "failed", label: "Failed" },
  { value: "skip", label: "Skip" },
  { value: "retest", label: "Retest" },
];

export default function TestDocumentor() {
  const params = useParams();
  const router = useRouter();
  const runId = params.runId as string;

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [saveFolder, setSaveFolder] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [testRunName, setTestRunName] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    if (!runId) return;

    // Load test run name
    const testRunsData = localStorage.getItem("testRunsData");
    if (testRunsData) {
      try {
        const parsedRunsData: TestRunsData = JSON.parse(testRunsData);
        const currentRun = parsedRunsData.testRuns.find(
          (run) => run.id === runId
        );
        if (currentRun) {
          setTestRunName(currentRun.name);
        } else {
          // Test run not found, redirect to test runs page
          router.push("/test-runs");
          return;
        }
      } catch (error) {
        console.error("Error parsing test runs data:", error);
      }
    }

    // Load test case data for this run
    const savedData = localStorage.getItem(`testDocumentorData_${runId}`);
    if (savedData) {
      try {
        const parsedData: LocalStorageData = JSON.parse(savedData);
        setTestCases(parsedData.testCases || []);
        setSaveFolder(parsedData.saveFolder || "");
      } catch (error) {
        console.error("Error parsing saved data:", error);
      }
    }
  }, [runId, router]);

  // Save data to localStorage whenever testCases or saveFolder changes
  useEffect(() => {
    if (!runId) return;

    const dataToSave: LocalStorageData = {
      testCases,
      saveFolder,
    };
    localStorage.setItem(
      `testDocumentorData_${runId}`,
      JSON.stringify(dataToSave)
    );

    // Update test run count in test runs data
    const testRunsData = localStorage.getItem("testRunsData");
    if (testRunsData) {
      try {
        const parsedRunsData: TestRunsData = JSON.parse(testRunsData);
        const updatedRuns = parsedRunsData.testRuns.map((run) =>
          run.id === runId
            ? {
                ...run,
                testCaseCount: testCases.length,
                lastModified: new Date().toISOString(),
              }
            : run
        );
        localStorage.setItem(
          "testRunsData",
          JSON.stringify({ testRuns: updatedRuns })
        );
      } catch (error) {
        console.error("Error updating test runs data:", error);
      }
    }
  }, [testCases, saveFolder, runId]);

  const removeVowelsFromWord = (word: string): string => {
    return word.replace(/[aeiouAEIOU]/g, "");
  };

  const truncateTestCase = (testCase: string): string => {
    // Remove period at the end if exists
    const processed = testCase.replace(/\.$/, "");

    if (processed.length <= 230) {
      return processed;
    }

    const words = processed.split(" ");
    let result = "";

    for (let i = 0; i < words.length; i++) {
      const currentWord = words[i];
      const potentialResult = result + (result ? " " : "") + currentWord;

      if (potentialResult.length <= 230) {
        result = potentialResult;
      } else {
        // Try removing vowels from current word
        const wordWithoutVowels = removeVowelsFromWord(currentWord);
        const potentialResultWithVowelsRemoved =
          result + (result ? " " : "") + wordWithoutVowels;

        if (potentialResultWithVowelsRemoved.length <= 230) {
          result = potentialResultWithVowelsRemoved;
        } else {
          // If even without vowels it's too long, stop here
          break;
        }
      }
    }

    return result;
  };

  const sanitizeFileName = (fileName: string): string => {
    // Remove forbidden characters: : / \ < > | " * ?
    return fileName.replace(/[:/\\<>|"*?]/g, "_").trim();
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(""), 3000);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCSVFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processCSVFile(e.target.files[0]);
    }
  };

  const processCSVFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("Please upload a CSV file.");
      return;
    }

    setIsUploading(true);

    try {
      const text = await file.text();
      const lines = text.split("\n").filter((line) => line.trim());

      if (lines.length < 2) {
        alert("CSV file must have at least a header row and one data row.");
        return;
      }

      // Skip header row and process data rows
      const dataRows = lines.slice(1);
      const newTestCases: TestCase[] = dataRows.map((line, index) => {
        // Split by comma but handle quoted values
        const columns = line
          .split(",")
          .map((col) => col.trim().replace(/^"|"$/g, ""));
        const originalTestCase = columns[0] || `Test Case ${index + 1}`;
        const truncatedTestCase = truncateTestCase(originalTestCase);

        return {
          id: `test-${Date.now()}-${index}`,
          testCase: truncatedTestCase,
          status: "skip" as const,
          imageNames: [],
        };
      });

      setTestCases(newTestCases);
    } catch (error) {
      console.error("Error processing CSV:", error);
      alert("Error processing CSV file. Please check the file format.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStatusChange = (
    testId: string,
    newStatus: TestCase["status"]
  ) => {
    setTestCases((prev) =>
      prev.map((test) =>
        test.id === testId ? { ...test, status: newStatus } : test
      )
    );
  };

  const handleScreenshotPaste = async (testId: string, modifier: string) => {
    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type);

            // Determine file extension based on MIME type
            let extension = "png"; // default
            if (type === "image/jpeg") extension = "jpg";
            else if (type === "image/gif") extension = "gif";
            else if (type === "image/webp") extension = "webp";

            // Find the test case
            const testCase = testCases.find((t) => t.id === testId);
            if (!testCase) return;

            // Create filename
            const baseFileName = sanitizeFileName(testCase.testCase);
            const modifierPart = modifier
              ? `_${sanitizeFileName(modifier)}`
              : "";
            const fileName = `${baseFileName}${modifierPart}.${extension}`;

            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;

            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Create timestamp
            const now = new Date();
            const timestamp = now.toLocaleTimeString("en-US", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            // Update test case with new image name and set status to pass
            setTestCases((prev) =>
              prev.map((test) =>
                test.id === testId
                  ? {
                      ...test,
                      imageNames: [...test.imageNames, fileName],
                      status: "pass" as const,
                      imagePasteTimestamp: timestamp,
                    }
                  : test
              )
            );

            return;
          }
        }
      }

      alert("No image found in clipboard. Please copy an image first.");
    } catch (error) {
      console.error("Error accessing clipboard:", error);
      alert(
        "Error accessing clipboard. Please make sure you have copied an image."
      );
    }
  };

  const handleImageNameClick = (imageName: string) => {
    navigator.clipboard
      .writeText(imageName)
      .then(() => {
        showSnackbar("Image name copied to clipboard!");
      })
      .catch((error) => {
        console.error("Error copying to clipboard:", error);
        showSnackbar("Failed to copy to clipboard");
      });
  };

  const handleImageNameDelete = (testId: string, imageName: string) => {
    setTestCases((prev) =>
      prev.map((test) =>
        test.id === testId
          ? {
              ...test,
              imageNames: test.imageNames.filter((name) => name !== imageName),
            }
          : test
      )
    );
    setShowDeleteConfirm(null);
  };

  const handleChooseDestination = () => {
    // For now, just let user input a folder path
    const folderPath = prompt("Enter the destination folder path:");
    if (folderPath) {
      setSaveFolder(folderPath);
    }
  };

  const handleClear = () => {
    setTestCases([]);
    setSaveFolder("");
    localStorage.removeItem(`testDocumentorData_${runId}`);
  };

  return (
    <>
      <style jsx global>{`
        :root {
          --tiket-blue: #0064d2;
          --tiket-yellow: #ffc900;
          --tiket-light-blue: #e6f3ff;
          --glass-bg: rgba(255, 255, 255, 0.6);
          --glass-border: rgba(255, 255, 255, 0.3);
          --shadow-color: rgba(0, 0, 0, 0.1);
          --text-primary: #1a202c;
          --text-secondary: #4a5568;
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
          -webkit-backdrop-filter: blur(10px);
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
        .snackbar {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #10b981;
          color: white;
          padding: 12px 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/tiketcom logo.png"
                  alt="Tiket.com Logo"
                  width={120}
                  height={40}
                  className="h-10 w-auto"
                />
                <span className="ml-3 text-2xl font-bold text-[var(--tiket-blue)]">
                  Test Case Documentor
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/test-runs"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                ← Back to Test Runs
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-10rem)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl">
              <span className="block text-purple-600">{testRunName}</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-[var(--text-secondary)]">
              Document your test cases with screenshots
            </p>
          </div>

          {testCases.length === 0 ? (
            // Upload Section
            <div className="space-y-6">
              {/* Destination Selection */}
              <section className="glass-card">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                  Choose Save Destination
                </h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleChooseDestination}
                    className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-[var(--tiket-blue)] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Choose Destination
                  </button>
                  {saveFolder && (
                    <span className="text-sm text-[var(--text-secondary)]">
                      Destination: {saveFolder}
                    </span>
                  )}
                </div>
              </section>

              {/* CSV Upload */}
              <section className="glass-card">
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-6 text-center">
                  Upload Test Cases CSV
                </h2>
                <div
                  className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-all duration-200 ease-in-out cursor-pointer
                    ${
                      dragActive
                        ? "border-purple-500 bg-purple-50/50 scale-105"
                        : "border-gray-300 hover:border-gray-400"
                    }
                    ${
                      isUploading
                        ? "opacity-60 pointer-events-none"
                        : "hover:bg-gray-50/30"
                    }
                  `}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="text-center p-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-lg font-semibold text-[var(--text-primary)]">
                        Processing CSV file...
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
                        Drag & drop your CSV file here
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        or{" "}
                        <span className="font-semibold text-purple-600">
                          click to browse
                        </span>
                      </p>
                      <p className="mt-4 text-xs text-gray-400">
                        CSV files only. First column will be used as test cases.
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </div>
              </section>
            </div>
          ) : (
            // Test Cases List View
            <div className="space-y-6">
              {/* Controls */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-[var(--text-primary)]">
                  Test Cases ({testCases.length})
                </h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setTestCases([])}
                    className="px-6 py-3 rounded-lg text-sm font-semibold text-purple-600 bg-white border-2 border-purple-600 hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Upload New CSV
                  </button>
                  <button
                    onClick={handleClear}
                    className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Test Cases Grid */}
              <div className="space-y-4">
                {testCases.map((testCase) => (
                  <TestCaseTile
                    key={testCase.id}
                    testCase={testCase}
                    onStatusChange={handleStatusChange}
                    onScreenshotPaste={handleScreenshotPaste}
                    onImageNameClick={handleImageNameClick}
                    onImageNameDelete={handleImageNameDelete}
                    showDeleteConfirm={showDeleteConfirm}
                    setShowDeleteConfirm={setShowDeleteConfirm}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Snackbar */}
      {snackbarMessage && <div className="snackbar">{snackbarMessage}</div>}

      {/* Custom Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Delete Image
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this image documentation? This
                action cannot be undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const [testId, imageName] = showDeleteConfirm.split("|");
                  handleImageNameDelete(testId, imageName);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface TestCaseTileProps {
  testCase: TestCase;
  onStatusChange: (testId: string, status: TestCase["status"]) => void;
  onScreenshotPaste: (testId: string, modifier: string) => void;
  onImageNameClick: (imageName: string) => void;
  onImageNameDelete: (testId: string, imageName: string) => void;
  showDeleteConfirm: string | null;
  setShowDeleteConfirm: (value: string | null) => void;
}

function TestCaseTile({
  testCase,
  onStatusChange,
  onScreenshotPaste,
  onImageNameClick,
  onImageNameDelete: _onImageNameDelete,
  showDeleteConfirm: _showDeleteConfirm,
  setShowDeleteConfirm: _setShowDeleteConfirm,
}: TestCaseTileProps) {
  const [modifier, setModifier] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isProcessing) {
      setIsProcessing(true);
      await onScreenshotPaste(testCase.id, modifier);
      setModifier("");
      setIsProcessing(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, imageName: string) => {
    e.preventDefault();
    setShowDeleteConfirm(`${testCase.id}|${imageName}`);
  };

  return (
    <div className="glass-card">
      {/* Main tile with 3 columns */}
      <div className="grid grid-cols-12 gap-4 items-center">
        {/* Test Case - Column 1 (5 columns) */}
        <div className="col-span-5">
          <p className="text-sm font-medium text-[var(--text-primary)] break-words">
            {testCase.testCase}
          </p>
        </div>

        {/* Status Dropdown - Column 2 (3 columns) */}
        <div className="col-span-3">
          <select
            value={testCase.status}
            onChange={(e) =>
              onStatusChange(testCase.id, e.target.value as TestCase["status"])
            }
            className={`w-full px-3 py-2 text-sm font-medium rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors duration-200 ${
              statusColors[testCase.status]
            }`}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Screenshot Field - Column 3 (4 columns) */}
        <div className="col-span-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              {testCase.imagePasteTimestamp && (
                <div className="text-xs font-semibold text-green-600 mb-1">
                  [Image pasted {testCase.imagePasteTimestamp}]
                </div>
              )}
              <input
                type="text"
                value={modifier}
                onChange={(e) => setModifier(e.target.value.slice(0, 16))}
                onKeyPress={handleKeyPress}
                placeholder="Paste screenshot + modifier (16 chars max)"
                disabled={isProcessing}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
              />
            </div>
            {isProcessing && (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Paste image from clipboard and press Enter
          </p>
        </div>
      </div>

      {/* Image Names Row */}
      {testCase.imageNames.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {testCase.imageNames.map((imageName, index) => (
              <button
                key={index}
                onClick={() => onImageNameClick(imageName)}
                onContextMenu={(e) => handleContextMenu(e, imageName)}
                className="text-xs text-gray-500 hover:text-purple-600 hover:underline transition-colors duration-200 cursor-pointer"
                title="Click to copy, right-click to delete"
              >
                {imageName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
