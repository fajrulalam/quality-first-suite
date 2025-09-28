"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

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

export default function TestDocumentorClient() {
  const params = useParams();
  const runId = params.runId as string;

  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [saveFolder, setSaveFolder] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [testRunName, setTestRunName] = useState<string>("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [snackbarMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = () => {
      const storedData = localStorage.getItem(`testRun_${runId}`);
      if (storedData) {
        try {
          const parsedData: LocalStorageData = JSON.parse(storedData);
          setTestCases(parsedData.testCases || []);
          setSaveFolder(parsedData.saveFolder || "");
        } catch (error) {
          console.error("Error parsing stored data:", error);
        }
      }

      // Load test run name
      const testRunsData = localStorage.getItem("testRuns");
      if (testRunsData) {
        try {
          const parsedTestRuns: TestRunsData = JSON.parse(testRunsData);
          const currentTestRun = parsedTestRuns.testRuns.find(
            (run) => run.id === runId
          );
          if (currentTestRun) {
            setTestRunName(currentTestRun.name);
          }
        } catch (error) {
          console.error("Error loading test run name:", error);
        }
      }
    };

    loadData();
  }, [runId]);

  // Save data to localStorage whenever testCases or saveFolder changes
  useEffect(() => {
    if (testCases.length > 0 || saveFolder) {
      const dataToSave: LocalStorageData = {
        testCases,
        saveFolder,
      };
      localStorage.setItem(`testRun_${runId}`, JSON.stringify(dataToSave));

      // Update the lastModified timestamp in testRuns
      const testRunsData = localStorage.getItem("testRuns");
      if (testRunsData) {
        try {
          const parsedTestRuns: TestRunsData = JSON.parse(testRunsData);
          const runIndex = parsedTestRuns.testRuns.findIndex(
            (run) => run.id === runId
          );
          if (runIndex !== -1) {
            parsedTestRuns.testRuns[runIndex].lastModified =
              new Date().toISOString();
            parsedTestRuns.testRuns[runIndex].testCaseCount = testCases.length;
            localStorage.setItem("testRuns", JSON.stringify(parsedTestRuns));
          }
        } catch (error) {
          console.error("Error updating test run timestamp:", error);
        }
      }
    }
  }, [testCases, saveFolder, runId]);

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: Date.now().toString(),
      testCase: "",
      status: "failed",
      imageNames: [],
    };
    setTestCases([...testCases, newTestCase]);
  };

  const updateTestCase = (id: string, field: keyof TestCase, value: string | string[]) => {
    setTestCases(
      testCases.map((testCase) =>
        testCase.id === id ? { ...testCase, [field]: value } : testCase
      )
    );
  };



  const handleFileUpload = async (files: FileList) => {
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("image/")) {
          // Create a unique filename
          const timestamp = Date.now();
          const fileExtension = file.name.split(".").pop();
          const filename = `image_${timestamp}_${i}.${fileExtension}`;

          // Convert file to base64 and store
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result as string;
            localStorage.setItem(`image_${filename}`, base64String);
          };
          reader.readAsDataURL(file);

          // Create a new test case for each image
          const newTestCase: TestCase = {
            id: timestamp.toString() + i,
            testCase: `Test case for ${file.name}`,
            status: "failed",
            imageNames: [filename],
            imagePasteTimestamp: new Date().toISOString(),
          };
          setTestCases((prev) => [...prev, newTestCase]);
        }
      }
    } catch (error) {
      console.error("Error uploading files:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const downloadTestCases = () => {
    const dataToExport = {
      testRunName,
      runId,
      exportDate: new Date().toISOString(),
      saveFolder,
      testCases: testCases.map((testCase) => ({
        ...testCase,
        images: testCase.imageNames.map((imageName) => {
          const imageData = localStorage.getItem(`image_${imageName}`);
          return {
            name: imageName,
            data: imageData,
          };
        }),
      })),
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `test-cases-${testRunName || runId}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleScreenshotPaste = async (testCaseId: string) => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const clipboardItem of clipboardItems) {
        for (const type of clipboardItem.types) {
          if (type.startsWith("image/")) {
            const blob = await clipboardItem.getType(type);
            const reader = new FileReader();
            reader.onload = () => {
              const base64String = reader.result as string;
              const timestamp = Date.now();
              const filename = `screenshot_${timestamp}.png`;

              // Store the image
              localStorage.setItem(`image_${filename}`, base64String);

              // Update the test case
              updateTestCase(testCaseId, "imageNames", [
                ...testCases.find((tc) => tc.id === testCaseId)?.imageNames ||
                  [],
                filename,
              ]);
              updateTestCase(
                testCaseId,
                "imagePasteTimestamp",
                new Date().toISOString()
              );
            };
            reader.readAsDataURL(blob);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error pasting screenshot:", error);
    }
  };

  const clearTestRun = () => {
    setTestCases([]);
    setSaveFolder("");
    localStorage.removeItem(`testRun_${runId}`);
    
    // Clear all associated images
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('image_')) {
        localStorage.removeItem(key);
      }
    });
  };

  const deleteImage = (testCaseId: string, imageName: string) => {
    // Remove from localStorage
    localStorage.removeItem(`image_${imageName}`);
    
    // Update test case
    const testCase = testCases.find(tc => tc.id === testCaseId);
    if (testCase) {
      const updatedImageNames = testCase.imageNames.filter(name => name !== imageName);
      updateTestCase(testCaseId, "imageNames", updatedImageNames);
    }
    
    // Hide confirmation dialog
    setShowDeleteConfirm(null);
  };

  const handleImageNameClick = (imageName: string) => {
    const imageData = localStorage.getItem(`image_${imageName}`);
    if (imageData) {
      // Create a new window/tab to display the image
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>${imageName}</title></head>
            <body style="margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0;">
              <img src="${imageData}" style="max-width: 100%; max-height: 100vh; object-fit: contain;" alt="${imageName}"/>
            </body>
          </html>
        `);
      }
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link
                href="/test-runs"
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-2"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Test Runs
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                {testRunName || `Test Run ${runId}`}
              </h1>
              <p className="text-gray-600 mt-1">
                Document your test cases with screenshots and results
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={addTestCase}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Test Case
              </button>
              <button
                onClick={downloadTestCases}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                disabled={testCases.length === 0}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download
              </button>
              <button
                onClick={clearTestRun}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Clear All
              </button>
            </div>
          </div>

          {/* Save Folder Input */}
          <div className="glass-card mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Save Folder:
              </label>
              <input
                type="text"
                value={saveFolder}
                onChange={(e) => setSaveFolder(e.target.value)}
                placeholder="Enter folder path for saving files..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Upload Section */}
          <div
            className={`glass-card border-2 border-dashed transition-colors ${
              dragActive
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-300 hover:border-indigo-400"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center py-6">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    Drop images here, or{" "}
                    <span className="text-indigo-600">browse</span>
                  </span>
                </label>
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleFileUpload(e.target.files)
                  }
                />
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB each
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Test Cases */}
        <div className="space-y-4">
          {testCases.map((testCase) => (
            <TestCaseTile
              key={testCase.id}
              testCase={testCase}
              onStatusChange={(status) =>
                updateTestCase(testCase.id, "status", status)
              }
              onScreenshotPaste={() => handleScreenshotPaste(testCase.id)}
              onImageNameClick={handleImageNameClick}
              setShowDeleteConfirm={setShowDeleteConfirm}
              onTestCaseUpdate={(field, value) => updateTestCase(testCase.id, field, value)}
            />
          ))}

          {testCases.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-24 w-24 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No test cases yet
              </h3>
              <p className="mt-2 text-gray-500">
                Get started by adding your first test case or uploading screenshots.
              </p>
              <button
                onClick={addTestCase}
                className="mt-4 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add First Test Case
              </button>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delete Image
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this image? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const [testCaseId, imageName] = showDeleteConfirm.split('|');
                    deleteImage(testCaseId, imageName);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Snackbar */}
        {snackbarMessage && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {snackbarMessage}
          </div>
        )}

        {/* Loading overlay */}
        {isUploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <span className="text-gray-700">Uploading images...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Component interfaces and props
interface TestCaseTileProps {
  testCase: TestCase;
  onStatusChange: (status: TestCase["status"]) => void;
  onScreenshotPaste: () => void;
  onImageNameClick: (imageName: string) => void;
  setShowDeleteConfirm: (value: string | null) => void;
  onTestCaseUpdate: (field: keyof TestCase, value: string | string[]) => void;
}

function TestCaseTile({
  testCase,
  onStatusChange,
  onScreenshotPaste,
  onImageNameClick,
  setShowDeleteConfirm,
  onTestCaseUpdate,
}: TestCaseTileProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isProcessing) {
      setIsProcessing(true);
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Test Case
            </label>
            <textarea
              value={testCase.testCase}
              onChange={(e) => onTestCaseUpdate("testCase", e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Describe your test case..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              rows={3}
            />
          </div>
        </div>

        {/* Status - Column 2 (2 columns) */}
        <div className="col-span-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              value={testCase.status}
              onChange={(e) =>
                onStatusChange(e.target.value as TestCase["status"])
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
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
        </div>

        {/* Actions - Column 3 (5 columns) */}
        <div className="col-span-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Actions</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={onScreenshotPaste}
                className="flex-1 min-w-[120px] bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Paste Screenshot
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Images Section - Full width below main content */}
      {testCase.imageNames.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            Screenshots ({testCase.imageNames.length})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {testCase.imageNames.map((imageName, index) => {
              const imageData = localStorage.getItem(`image_${imageName}`);
              return (
                <div key={index} className="relative group">
                  <div
                    className="aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => onImageNameClick(imageName)}
                    onContextMenu={(e) => handleContextMenu(e, imageName)}
                  >
                    {imageData ? (
                      <Image
                        src={imageData}
                        alt={`Screenshot ${index + 1}`}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 truncate" title={imageName}>
                      {imageName}
                    </p>
                    {testCase.imagePasteTimestamp && (
                      <p className="text-xs text-gray-500">
                        {new Date(testCase.imagePasteTimestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}