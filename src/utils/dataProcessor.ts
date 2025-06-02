import { TestData } from './types';

// Function to combine data from first and second run
export const combineRegressionData = (
  firstRunData: TestData[],
  secondRunData: TestData[]
): TestData[] => {
  const combinedResults: TestData[] = [];
  const testNameMap = new Map<
    string,
    { firstRun: TestData | null; secondRun: TestData | null }
  >();

  // Process first run data
  firstRunData.forEach((test) => {
    testNameMap.set(test.testName, { firstRun: test, secondRun: null });
  });

  // Process second run data
  secondRunData.forEach((test) => {
    const existingEntry = testNameMap.get(test.testName);
    if (existingEntry) {
      existingEntry.secondRun = test;
    } else {
      testNameMap.set(test.testName, { firstRun: null, secondRun: test });
    }
  });

  // Combine the data and determine passedIn status
  testNameMap.forEach((entry, testName) => {
    const { firstRun, secondRun } = entry;

    let passedIn = "Manual";
    let status = "FAIL";
    const issueType = "";
    let rootCause = "";

    // Determine passedIn status
    if (firstRun && firstRun.status === "PASS") {
      passedIn = "1st run";
      status = "PASS";
    } else if (secondRun && secondRun.status === "PASS") {
      passedIn = "2nd run";
      status = "PASS";
    } else if (!firstRun && secondRun && secondRun.status === "FAIL") {
      passedIn = "Manual";
      status = "FAIL";
      rootCause = secondRun.failureReason;
    } else if (firstRun && !secondRun) {
      passedIn = "Manual";
      status = "FAIL";
      rootCause = firstRun.failureReason;
    } else if (firstRun && secondRun && secondRun.status === "FAIL") {
      passedIn = "Manual";
      status = "FAIL";
      rootCause = secondRun.failureReason;
    }

    // Add to combined results
    combinedResults.push({
      testName,
      status,
      sessionId: (secondRun || firstRun)?.sessionId || "",
      failureStep: (secondRun || firstRun)?.failureStep || "",
      exceptionMessage: (secondRun || firstRun)?.exceptionMessage || "",
      failureReason: (secondRun || firstRun)?.failureReason || "",
      passedIn,
      issueType,
      rootCause,
    });
  });

  return combinedResults;
};

// Function to convert regression data to CSV
export const convertRegressionDataToCsv = (data: TestData[]): string => {
  // CSV header
  let csvContent =
    "testName,status,sessionId,failureStep,exceptionMessage,failureReason,passedIn,issueType,rootCause\n";

  // Add each row
  data.forEach((item) => {
    const escapeCsvField = (field: string) => {
      // Escape quotes and wrap in quotes
      return `"${(field || "").replace(/"/g, '""')}"`;
    };

    csvContent +=
      [
        escapeCsvField(item.testName),
        escapeCsvField(item.status),
        escapeCsvField(item.sessionId),
        escapeCsvField(item.failureStep),
        escapeCsvField(item.exceptionMessage),
        escapeCsvField(item.failureReason),
        escapeCsvField(item.passedIn || ""),
        escapeCsvField(item.issueType || ""),
        escapeCsvField(item.rootCause || ""),
      ].join(",") + "\n";
  });

  return csvContent;
};

// Function to convert data to CSV for general analysis
export const convertDataToCsv = (data: TestData[]): string => {
  // CSV header
  let csvContent =
    "testName,status,sessionId,failureStep,exceptionMessage,failureReason\n";

  // If no data, add a placeholder message
  if (data.length === 0) {
    csvContent += "No test cases found in the HTML file,,,,,";
    return csvContent;
  }

  // Add each row
  data.forEach((item) => {
    const escapeCsvField = (field: string) => {
      // Escape quotes and wrap in quotes
      return `"${(field || "").replace(/"/g, '""')}"`;
    };

    csvContent +=
      [
        escapeCsvField(item.testName),
        escapeCsvField(item.status),
        escapeCsvField(item.sessionId),
        escapeCsvField(item.failureStep),
        escapeCsvField(item.exceptionMessage),
        escapeCsvField(item.failureReason),
      ].join(",") + "\n";
  });

  return csvContent;
};

// Parse CSV data for preview
export const parseCSVForPreview = (csvString: string) => {
  if (!csvString) return { headers: [], rows: [] };

  const lines = csvString.split("\n");
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((header) => {
    // Remove quotes if present
    return header.replace(/^"(.*)"$/, "$1");
  });

  const rows: string[][] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Handle quoted fields with commas
    const row: string[] = [];
    let inQuotes = false;
    let currentField = "";

    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];

      if (char === '"') {
        // Check if it's an escaped quote (double quote)
        if (j + 1 < lines[i].length && lines[i][j + 1] === '"') {
          currentField += '"';
          j++; // Skip the next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push(currentField);
        currentField = "";
      } else {
        currentField += char;
      }
    }

    // Add the last field
    row.push(currentField);

    // Add the row to the rows array
    rows.push(row);
  }

  return { headers, rows };
};