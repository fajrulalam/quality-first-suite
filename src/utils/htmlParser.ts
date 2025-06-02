import { TestData } from './types';

// Parse HTML content into structured TestData array
export const parseHtmlToData = (htmlContent: string): TestData[] => {
  // Remove exception section
  const htmlWithoutException = htmlContent.replace(
    /<ul class="tools pull-left"><li><a href=""><span class="font-size-14">Exception<\/span><\/a><\/li><\/ul>[\s\S]*$/,
    ""
  );

  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlWithoutException, "text/html");

  // Find all test containers
  const testContainers = doc.querySelectorAll("li.test-item");
  const results: TestData[] = [];

  // Process each test case
  testContainers.forEach((testContainer) => {
    // Extract test name
    const testNameElement = testContainer.querySelector(
      "div.test-detail p.name"
    );
    const testName = testNameElement?.textContent?.trim() || "";

    // Extract status (FAIL/PASS)
    const statusElement = testContainer.querySelector("h5.test-status");
    const statusClass = statusElement?.className || "";
    const status = statusClass.includes("text-fail") ? "FAIL" : "PASS";

    // Extract session ID
    let sessionId = "";
    const sessionText = testContainer.textContent || "";
    const sessionMatch = sessionText.match(/sessionId=([\w-]+)/);
    if (sessionMatch && sessionMatch[1]) {
      sessionId = sessionMatch[1];
    }

    // If status is FAIL, extract failure information
    let failureStep = "";
    let exceptionMessage = "";
    let failureReason = "";

    if (status === "FAIL") {
      // Extract failure step (h4 with red color)
      const failureStepElement = testContainer.querySelector(
        "h4[style*='color: red']"
      );
      if (failureStepElement) {
        failureStep = failureStepElement.textContent?.trim() || "";
      }

      // Extract exception message from textarea with class code-block
      const codeBlockElement = testContainer.querySelector(
        "textarea.code-block"
      );
      if (codeBlockElement && codeBlockElement.textContent) {
        // Extract text before the colon
        const match = codeBlockElement.textContent.match(/^([^:]+)/);
        if (match && match[1]) {
          exceptionMessage = match[1].trim();
        }
      }

      // Extract failure reason (last span with darkorange color)
      const failureReasonElements = testContainer.querySelectorAll(
        "span[style*='color: darkorange']"
      );
      if (failureReasonElements.length > 0) {
        // Get the last warning message
        const lastElement =
          failureReasonElements[failureReasonElements.length - 1];
        failureReason = lastElement.textContent?.trim() || "";
      }
    }

    // Add to results array
    results.push({
      testName,
      status,
      sessionId,
      failureStep,
      exceptionMessage,
      failureReason,
    });
  });

  return results;
};