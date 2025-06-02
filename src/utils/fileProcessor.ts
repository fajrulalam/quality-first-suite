import { parseHtmlToData } from './htmlParser';
import { convertDataToCsv, convertRegressionDataToCsv, combineRegressionData } from './dataProcessor';
import { TestData } from './types';
import { createWorker } from './worker';
import { orderTestCases } from './orderingUtils';

// Setup worker and handlers for general file processing
export const processGeneralFile = (
  file: File,
  callbacks: {
    setIsProcessing: (isProcessing: boolean) => void;
    setProgress: (progress: number) => void;
    setCsvData: (csvData: string) => void;
    setFileName: (fileName: string) => void;
    setShowPreview: (showPreview: boolean) => void;
    setDragActive: (dragActive: boolean) => void;
  }
) => {
  const { setIsProcessing, setProgress, setCsvData, setFileName, setShowPreview, setDragActive } = callbacks;
  
  if (!file || !file.name.toLowerCase().endsWith(".html")) {
    alert("Please upload an HTML file");
    return;
  }

  setIsProcessing(true);
  setProgress(0);

  const worker = createWorker();
  if (!worker) {
    alert("Web Workers are not supported in your browser");
    setIsProcessing(false);
    return;
  }

  worker.onmessage = (e: MessageEvent) => {
    const { type, percentComplete, result, error } = e.data;

    if (type === "progress") {
      setProgress(percentComplete);
    } else if (type === "complete") {
      // Parse HTML to structured data
      const parsedData = parseHtmlToData(result);

      // Convert data to CSV
      const processedCsvData = convertDataToCsv(parsedData);

      // Store the CSV data and filename for preview
      setCsvData(processedCsvData);
      setFileName(file.name.replace(".html", ""));

      // Show the preview
      setShowPreview(true);
      setIsProcessing(false);
      setDragActive(false);
      setProgress(0);
    } else if (type === "error") {
      alert(`Error processing file: ${error}`);
      setIsProcessing(false);
      setDragActive(false);
      setProgress(0);
    }
  };

  // Start processing
  worker.postMessage({
    file,
    chunkSize: 2 * 1024 * 1024, // 2MB chunks
  });
};

// Process the first run file for regression analysis
export const processFirstRunFile = (
  file: File,
  callbacks: {
    setFirstRunFile: (file: File | null) => void;
    setIsProcessing: (isProcessing: boolean) => void;
    setProgress: (progress: number) => void;
    setFirstRunData: (data: TestData[]) => void;
    setFirstRunProcessed: (processed: boolean) => void;
    setDragActive: (dragActive: boolean) => void;
  }
) => {
  const { setFirstRunFile, setIsProcessing, setProgress, setFirstRunData, setFirstRunProcessed, setDragActive } = callbacks;
  
  if (!file || !file.name.toLowerCase().endsWith(".html")) {
    alert("Please upload an HTML file");
    return;
  }

  setFirstRunFile(file);
  setIsProcessing(true);
  setProgress(0);

  const worker = createWorker();
  if (!worker) {
    alert("Web Workers are not supported in your browser");
    setIsProcessing(false);
    return;
  }

  worker.onmessage = (e: MessageEvent) => {
    const { type, percentComplete, result, error } = e.data;

    if (type === "progress") {
      setProgress(percentComplete);
    } else if (type === "complete") {
      // Convert HTML to parsed data (not CSV yet)
      const parsedData = parseHtmlToData(result);
      setFirstRunData(parsedData);
      setFirstRunProcessed(true);

      // Reset processing state
      setIsProcessing(false);
      setDragActive(false);
      setProgress(0);
    } else if (type === "error") {
      alert(`Error processing file: ${error}`);
      setIsProcessing(false);
      setDragActive(false);
      setProgress(0);
    }
  };

  // Start processing
  worker.postMessage({
    file,
    chunkSize: 2 * 1024 * 1024, // 2MB chunks
  });
};

// Process the second run file for regression analysis
export const processSecondRunFile = (
  file: File,
  firstRunData: TestData[],
  callbacks: {
    setSecondRunFile: (file: File | null) => void;
    setIsProcessing: (isProcessing: boolean) => void;
    setProgress: (progress: number) => void;
    setSecondRunData: (data: TestData[]) => void;
    setCombinedData: (data: TestData[]) => void;
    setCsvData: (csvData: string) => void;
    setFileName: (fileName: string) => void;
    setShowPreview: (showPreview: boolean) => void;
    setDragActive: (dragActive: boolean) => void;
    testCaseOrder?: string;
  }
) => {
  const { 
    setSecondRunFile, setIsProcessing, setProgress, 
    setSecondRunData, setCombinedData, setCsvData,
    setFileName, setShowPreview, setDragActive 
  } = callbacks;
  
  // Get the testCaseOrder from the callbacks if it exists
  const testCaseOrder = callbacks.testCaseOrder || "";
  
  if (!file || !file.name.toLowerCase().endsWith(".html")) {
    alert("Please upload an HTML file");
    return;
  }

  setSecondRunFile(file);
  setIsProcessing(true);
  setProgress(0);

  const worker = createWorker();
  if (!worker) {
    alert("Web Workers are not supported in your browser");
    setIsProcessing(false);
    return;
  }

  worker.onmessage = (e: MessageEvent) => {
    const { type, percentComplete, result, error } = e.data;

    if (type === "progress") {
      setProgress(percentComplete);
    } else if (type === "complete") {
      // Convert HTML to parsed data
      const parsedData = parseHtmlToData(result);
      setSecondRunData(parsedData);

      // Combine first and second run data
      const combined = combineRegressionData(firstRunData, parsedData);
      
      // Order the combined results based on the provided order text if it exists
      const orderedData = testCaseOrder ? orderTestCases(combined, testCaseOrder) : combined;
      setCombinedData(orderedData);

      // Convert combined data to CSV
      const csvData = convertRegressionDataToCsv(orderedData);
      setCsvData(csvData);
      setFileName(
        `regression-analysis-${new Date().toISOString().slice(0, 10)}`
      );

      // Show the preview
      setShowPreview(true);
      setIsProcessing(false);
      setDragActive(false);
      setProgress(0);
    } else if (type === "error") {
      alert(`Error processing file: ${error}`);
      setIsProcessing(false);
      setDragActive(false);
      setProgress(0);
    }
  };

  // Start processing
  worker.postMessage({
    file,
    chunkSize: 2 * 1024 * 1024, // 2MB chunks
  });
};