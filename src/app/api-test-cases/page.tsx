"use client";

import React, { useState, useCallback } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import Link from 'next/link';

interface TestResult {
  apiName: string;
  testCase: string;
  parameters: string;
  response: string;
  httpStatus: number;
  responseCode?: string;
  responseMessage?: string;
  curlCommand?: string;
  errors?: string;
}

interface ProcessingStats {
  totalTests: number;
  passed: number;
  failed: number;
  errors: number;
  warnings: number;
}

export default function ApiTestCasesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [processingStats, setProcessingStats] = useState<ProcessingStats>({ 
    totalTests: 0, passed: 0, failed: 0, errors: 0, warnings: 0 
  });
  const [notifications, setNotifications] = useState<Array<{id: string, type: 'error' | 'warning' | 'info', message: string}>>([]);
  const [useProxy] = useState(true);
  const [sessionAccessToken, setSessionAccessToken] = useState('');
  const [sessionRefreshToken, setSessionRefreshToken] = useState('');
  
  // Copy cURL command to clipboard
  const copyCurlToClipboard = useCallback(async (curlCommand: string, testCase: string) => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      toast.success(`Copied "${testCase}" cURL to clipboard`);
    } catch (error) {
      console.error('Failed to copy cURL:', error);
      toast.error('Failed to copy cURL to clipboard');
    }
  }, []);

  const executeCurlInNewTab = useCallback(async (curlCommand: string) => {
    try {
      // Make request to our execution endpoint
      const response = await fetch('/api/curl-execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ curlCommand }),
      });

      // Get the HTML response
      const htmlContent = await response.text();

      // Create a new window/tab and write the HTML content
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      } else {
        toast.error('Failed to open new tab. Please allow popups for this site.');
      }
    } catch (error) {
      console.error('Failed to execute cURL:', error);
      toast.error('Failed to execute cURL command');
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        toast.success('Excel file selected successfully');
      } else {
        toast.error('Please select a valid Excel file (.xlsx)');
      }
    }
  };

  const downloadTemplate = useCallback(async () => {
    try {
      const response = await fetch('/api/api-test-cases/template');
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'api-test-template.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Download template error:', error);
      toast.error('Failed to download template');
    }
  }, []);

  const downloadResults = useCallback(async () => {
    if (testResults.length === 0) {
      toast.error('No test results to download');
      return;
    }

    try {
      const response = await fetch('/api/api-test-cases/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testResults),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `api-test-results-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download Excel file');
    }
  }, [testResults]);

  const processExcelFile = async () => {
    if (!file) {
      toast.error('Please select an Excel file first');
      return;
    }

    setIsProcessing(true);
    setTestResults([]);
    setProgress({ current: 0, total: 0 });
    setProcessingStats({ totalTests: 0, passed: 0, failed: 0, errors: 0, warnings: 0 });
    setNotifications([]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('useProxy', useProxy.toString());
      formData.append('sessionAccessToken', sessionAccessToken);
      formData.append('sessionRefreshToken', sessionRefreshToken);

      const response = await fetch('/api/api-test-cases/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Unable to read response stream');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            
            if (data.type === 'progress') {
              setProgress({ current: data.current, total: data.total });
            } else if (data.type === 'result') {
              const result = data.result;
              setTestResults(prev => [...prev, result]);
              
              // Update stats
              setProcessingStats(prev => {
                const newStats = { ...prev, totalTests: prev.totalTests + 1 };
                if (result.httpStatus >= 200 && result.httpStatus < 300) {
                  newStats.passed++;
                } else if (result.httpStatus === 0 || result.httpStatus >= 500) {
                  newStats.errors++;
                } else {
                  newStats.failed++;
                }
                return newStats;
              });
            } else if (data.type === 'error') {
              const notificationId = Date.now().toString();
              setNotifications(prev => [...prev, { id: notificationId, type: 'error', message: data.message }]);
              setProcessingStats(prev => ({ ...prev, errors: prev.errors + 1 }));
            } else if (data.type === 'warning') {
              const notificationId = Date.now().toString();
              setNotifications(prev => [...prev, { id: notificationId, type: 'warning', message: data.message }]);
              setProcessingStats(prev => ({ ...prev, warnings: prev.warnings + 1 }));
            } else if (data.type === 'info') {
              const notificationId = Date.now().toString();
              setNotifications(prev => [...prev, { id: notificationId, type: 'info', message: data.message }]);
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }

      toast.success('Processing completed successfully');
    } catch (error) {
      console.error('Processing error:', error);
      toast.error(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <span className="bg-green-100 p-2 rounded-xl mr-3">🔍</span>
                API Auto Test Cases Generator
              </h1>
              <p className="mt-2 text-gray-600">
                Upload an Excel file with cURL commands and systematically test field variations
              </p>
            </div>
            <Link 
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* File Upload Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Upload Test File</h2>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Download Template
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    disabled={isProcessing}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  {file && (
                    <div className="mt-3 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ {file.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Session Token Fields */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Access Token (Optional)
                      </label>
                      <input
                        type="text"
                        value={sessionAccessToken}
                        onChange={(e) => setSessionAccessToken(e.target.value)}
                        placeholder="Enter session_access_token value..."
                        disabled={isProcessing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Session Refresh Token (Optional)
                      </label>
                      <input
                        type="text"
                        value={sessionRefreshToken}
                        onChange={(e) => setSessionRefreshToken(e.target.value)}
                        placeholder="Enter session_refresh_token value..."
                        disabled={isProcessing}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                      />
                    </div>
                    {/*{(sessionAccessToken || sessionRefreshToken) && (*/}
                    {/*  <div className="bg-green-50 border border-green-200 rounded-lg p-3">*/}
                    {/*    /!*<p className="text-sm text-green-700">*!/*/}
                    {/*      /!*Session tokens will be automatically added to Cookie header:*!/*/}
                    {/*    /!*</p>*!/*/}
                    {/*    /!*<code className="text-xs text-green-600 mt-1 block bg-green-100 p-2 rounded">*!/*/}
                    {/*    /!*  Cookie: session_access_token={sessionAccessToken || '[empty]'};session_refresh_token={sessionRefreshToken || '[empty]'};*!/*/}
                    {/*    /!*</code>*!/*/}
                    {/*  </div>*/}
                    {/*)}*/}
                  </div>

                  {/*<div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">*/}
                  {/*  <div>*/}
                  {/*    <label className="flex items-center cursor-pointer">*/}
                  {/*      <input*/}
                  {/*        type="checkbox"*/}
                  {/*        checked={useProxy}*/}
                  {/*        onChange={(e) => setUseProxy(e.target.checked)}*/}
                  {/*        disabled={isProcessing}*/}
                  {/*        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"*/}
                  {/*      />*/}
                  {/*      <span className="ml-2 text-sm font-medium text-gray-900">Use Proxy Server</span>*/}
                  {/*    </label>*/}
                  {/*    <p className="text-xs text-gray-600 mt-1">*/}
                  {/*      {useProxy ? */}
                  {/*        "Bypasses CORS restrictions - works with any API" : */}
                  {/*        "⚠️ Direct requests may fail due to CORS"*/}
                  {/*      }*/}
                  {/*    </p>*/}
                  {/*  </div>*/}
                  {/*  <div className={`px-2 py-1 rounded text-xs font-medium ${useProxy ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>*/}
                  {/*    {useProxy ? 'Recommended' : 'Limited'}*/}
                  {/*  </div>*/}
                  {/*</div>*/}

                  <button
                    onClick={processExcelFile}
                    disabled={!file || isProcessing}
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>Start Testing</>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            {isProcessing && progress.total > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Test Cases</span>
                    <span className="font-semibold">{progress.current} / {progress.total}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out" 
                      style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                    />
                  </div>
                  <div className="text-center text-sm text-gray-500">
                    {progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}% Complete
                  </div>
                </div>
              </div>
            )}

            {/* Stats Card */}
            {(isProcessing || testResults.length > 0) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{processingStats.passed}</div>
                    <div className="text-sm text-green-700">Passed</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{processingStats.failed}</div>
                    <div className="text-sm text-red-700">Failed</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{processingStats.errors}</div>
                    <div className="text-sm text-yellow-700">Errors</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{processingStats.totalTests}</div>
                    <div className="text-sm text-blue-700">Total</div>
                  </div>
                </div>
              </div>
            )}

            {/* Help Card */}
            {/*<div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6">*/}
            {/*  <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 How it works</h3>*/}
            {/*  <ul className="text-sm text-gray-700 space-y-2">*/}
            {/*    <li className="flex items-start">*/}
            {/*      <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">1</span>*/}
            {/*      Column A: cURL command with valid values*/}
            {/*    </li>*/}
            {/*    <li className="flex items-start">*/}
            {/*      <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">2</span>*/}
            {/*      Column B: Fields to test (comma-separated)*/}
            {/*    </li>*/}
            {/*    <li className="flex items-start">*/}
            {/*      <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2 mt-0.5">3</span>*/}
            {/*      System tests empty & invalid values*/}
            {/*    </li>*/}
            {/*  </ul>*/}
            {/*</div>*/}
          </div>

          {/* Right Column - Results & Notifications */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notifications */}
            {notifications.length > 0 && (
              <div className="space-y-2">
                {notifications.slice(-3).map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-lg ${
                      notification.type === 'error' ? 'bg-red-50 border border-red-200' :
                      notification.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <p className={`text-sm ${
                      notification.type === 'error' ? 'text-red-700' :
                      notification.type === 'warning' ? 'text-yellow-700' :
                      'text-blue-700'
                    }`}>
                      {notification.message}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Results Section */}
            {testResults.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                      📋 Test Results 
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {testResults.length} tests
                      </span>
                    </h2>
                    <button
                      onClick={downloadResults}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Excel
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            API Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Test Case
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parameters
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Response
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Errors
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hit this curl
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {testResults.map((result, index) => (
                          <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-blue-600">{result.apiName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{result.testCase}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                result.httpStatus >= 200 && result.httpStatus < 300 
                                  ? 'bg-green-100 text-green-800' 
                                  : result.httpStatus === 0
                                  ? 'bg-gray-100 text-gray-800'
                                  : result.httpStatus >= 400 
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {result.httpStatus === 0 ? 'CORS' : result.httpStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs">
                                <div 
                                  className="truncate cursor-help" 
                                  title={result.parameters}
                                >
                                  {result.parameters}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-md">
                                <div 
                                  className="truncate cursor-help" 
                                  title={result.response}
                                >
                                  {result.response}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-xs">
                                {result.errors ? (
                                  <div 
                                    className="truncate cursor-help text-red-600" 
                                    title={result.errors}
                                  >
                                    {result.errors}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No errors</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {result.curlCommand && (
                                <button
                                  onClick={() => executeCurlInNewTab(result.curlCommand!)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                  title="Execute cURL and view formatted response in new tab"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M7 7l10 10M17 7v4M17 7h-4" />
                                  </svg>
                                  Execute
                                </button>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {result.curlCommand && (
                                <button
                                  onClick={() => copyCurlToClipboard(result.curlCommand!, result.testCase)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                  title="Copy cURL command to clipboard"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  Copy cURL
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                </div>
              </div>
            )}

            {/* Empty State or Getting Started */}
            {!isProcessing && testResults.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                {/*<div className="max-w-md mx-auto">*/}
                {/*  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">*/}
                {/*    <span className="text-2xl font-semibold">API</span>*/}
                {/*  </div>*/}
                {/*  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Start Testing</h3>*/}
                {/*  <p className="text-gray-600 mb-4">*/}
                {/*    Upload an Excel file with your cURL commands and field specifications to begin automated API testing.*/}
                {/*  </p>*/}
                {/*  <div className="bg-blue-50 rounded-lg p-4 text-left">*/}
                {/*    <h4 className="font-medium text-gray-900 mb-3">Excel Format Required:</h4>*/}
                {/*    <ul className="text-sm text-gray-600 space-y-1 mb-4">*/}
                {/*      <li><strong>Column A:</strong> API Name</li>*/}
                {/*      <li><strong>Column B:</strong> cURL Command (single line)</li>*/}
                {/*      <li><strong>Column C:</strong> Variables with custom values</li>*/}
                {/*    </ul>*/}
                {/*    <button*/}
                {/*      onClick={downloadTemplate}*/}
                {/*      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"*/}
                {/*    >*/}
                {/*      Download Template File*/}
                {/*    </button>*/}
                {/*  </div>*/}
                {/*</div>*/}
              </div>
            )}
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}