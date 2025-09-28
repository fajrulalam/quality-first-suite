"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

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

export default function TestRuns() {
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRunName, setNewRunName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Load test runs from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("testRunsData");
    console.log("Loading test runs from localStorage:", savedData);
    if (savedData) {
      try {
        const parsedData: TestRunsData = JSON.parse(savedData);
        console.log("Parsed test runs:", parsedData.testRuns);
        setTestRuns(parsedData.testRuns || []);
      } catch (error) {
        console.error("Error parsing test runs data:", error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save test runs to localStorage (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    console.log("Saving test runs to localStorage:", testRuns);
    const dataToSave: TestRunsData = { testRuns };
    localStorage.setItem("testRunsData", JSON.stringify(dataToSave));
  }, [testRuns, isInitialized]);

  const handleCreateTestRun = () => {
    if (!newRunName.trim()) return;

    const newTestRun: TestRun = {
      id: `run-${Date.now()}`,
      name: newRunName.trim().slice(0, 255),
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      testCaseCount: 0,
    };

    setTestRuns((prev) => [newTestRun, ...prev]);
    setNewRunName("");
    setIsCreating(false);

    // Navigate to the test documentor for this run
    router.push(`/test-documentor?runId=${newTestRun.id}`);
  };

  const handleEditTestRun = (id: string) => {
    if (!editingName.trim()) return;

    setTestRuns((prev) =>
      prev.map((run) =>
        run.id === id
          ? {
              ...run,
              name: editingName.trim().slice(0, 255),
              lastModified: new Date().toISOString(),
            }
          : run
      )
    );
    setEditingId(null);
    setEditingName("");
  };

  const handleDeleteTestRun = (id: string) => {
    setTestRuns((prev) => prev.filter((run) => run.id !== id));
    // Also remove the test run data from localStorage
    localStorage.removeItem(`testDocumentorData_${id}`);
    setShowDeleteConfirm(null);
  };

  const handleTestRunClick = (id: string) => {
    router.push(`/test-documentor?runId=${id}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
                  Test Documentor - Test Runs
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-10rem)] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl">
              <span className="block">Test Documentor</span>
              <span className="block text-purple-600">Test Runs</span>
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-[var(--text-secondary)]">
              Manage and organize your test documentation runs
            </p>
          </div>

          {/* Create New Test Run Section */}
          <section className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Test Runs ({testRuns.length})
              </h2>
              <button
                onClick={() => setIsCreating(true)}
                className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                + Create New Test Run
              </button>
            </div>

            {/* Create New Test Run Form */}
            {isCreating && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-3">
                  Create New Test Run
                </h3>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newRunName}
                    onChange={(e) => setNewRunName(e.target.value)}
                    placeholder="Enter test run name (max 255 characters)"
                    maxLength={255}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleCreateTestRun();
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={handleCreateTestRun}
                    disabled={!newRunName.trim()}
                    className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreating(false);
                      setNewRunName("");
                    }}
                    className="px-6 py-2 rounded-lg text-sm font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {newRunName.length}/255 characters
                </p>
              </div>
            )}

            {/* Test Runs List */}
            {testRuns.length === 0 && !isCreating ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-[var(--text-primary)] mb-2">
                  No test runs yet
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  Create your first test run to start documenting test cases
                </p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-6 py-3 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Create Your First Test Run
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {testRuns.map((testRun) => (
                  <div
                    key={testRun.id}
                    className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-white/90 transition-all duration-200 cursor-pointer group"
                    onClick={() => handleTestRunClick(testRun.id)}
                  >
                    <div className="flex-1 min-w-0">
                      {editingId === testRun.id ? (
                        <div
                          className="flex space-x-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            maxLength={255}
                            className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleEditTestRun(testRun.id);
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleEditTestRun(testRun.id)}
                            className="px-3 py-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingId(null);
                              setEditingName("");
                            }}
                            className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-lg font-medium text-[var(--text-primary)] group-hover:text-purple-600 transition-colors duration-200 truncate">
                            {testRun.name}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-[var(--text-secondary)]">
                            <span>
                              Created: {formatDate(testRun.createdAt)}
                            </span>
                            <span>•</span>
                            <span>
                              Modified: {formatDate(testRun.lastModified)}
                            </span>
                            <span>•</span>
                            <span>{testRun.testCaseCount} test cases</span>
                          </div>
                        </>
                      )}
                    </div>

                    {editingId !== testRun.id && (
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingId(testRun.id);
                            setEditingName(testRun.name);
                          }}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Edit test run name"
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(testRun.id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Delete test run"
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

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
                  Delete Test Run
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this test run? This action
                cannot be undone and will permanently remove all associated test
                cases and documentation.
              </p>
              <p className="text-sm font-medium text-gray-700 mt-2">
                Test Run:{" "}
                {testRuns.find((run) => run.id === showDeleteConfirm)?.name}
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
                onClick={() => handleDeleteTestRun(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Delete Test Run
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
