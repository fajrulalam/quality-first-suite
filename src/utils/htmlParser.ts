import { TestData } from './types';

// Parse API HTML content into structured TestData array
export const parseApiHtmlToData = (htmlContent: string): TestData[] => {
  // Create a DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  // Find all test containers (li.test-item)
  const testContainers = doc.querySelectorAll("li.test-item");
  const results: TestData[] = [];

  // Process each test case
  testContainers.forEach((testContainer) => {
    // Extract test name - from p.name or h5.test-status
    let testName = "";
    const testNameElement = testContainer.querySelector(
      "div.test-detail p.name"
    );
    const testStatusElement = testContainer.querySelector(
      "h5.test-status"
    );
    
    if (testNameElement) {
      // Get text content up to the first h6 tag (excluding h6 content)
      const testNameContent = testNameElement.childNodes[0];
      if (testNameContent) {
        testName = testNameContent.textContent?.trim() || "";
      }
    } else if (testStatusElement) {
      // Get text content up to the first h6 tag
      const testStatusContent = testStatusElement.childNodes[0];
      if (testStatusContent) {
        testName = testStatusContent.textContent?.trim() || "";
      }
    }

    // Extract scenario name from h6 element containing "Scenario Name :" (case insensitive)
    let scenario = "";
    const scenarioElements = testContainer.querySelectorAll("h6");
    scenarioElements.forEach((element) => {
      const content = element.textContent || "";
      if (content.toLowerCase().includes("scenario name")) {
        const splitContent = content.split(":");
        if (splitContent.length > 1) {
          scenario = splitContent[1].trim();
        } else {
          scenario = content.replace(/scenario\s+name/i, "").trim();
        }
      }
    });

    // Extract status (Pass, Failed, Skip)
    let status = "";
    const passElement = testContainer.querySelector(".test-status.text-pass");
    const failElement = testContainer.querySelector(".test-status.text-fail");
    const skipElement = testContainer.querySelector(".badge.log.skip-bg");

    if (passElement) {
      status = "Pass";
    } else if (failElement) {
      status = "Failed";
    } else if (skipElement) {
      status = "Skip";
    }

    // Extract failure step if status is Failed
    let failureStep = "";
    let exceptionMessage = "";

    if (status === "Failed") {
      // Extract failure step (h5 with color: black containing "Test Step:")
      const failureStepElements = testContainer.querySelectorAll(
        "h5[style*='color: black']"
      );
      failureStepElements.forEach((element) => {
        const content = element.textContent || "";
        if (content.includes("Test Step:")) {
          const splitContent = content.split(":");
          if (splitContent.length > 1) {
            failureStep = splitContent[1].trim();
          }
        }
      });

      // Extract exception message from textarea with class code-block
      const codeBlockElement = testContainer.querySelector(
        "textarea.code-block"
      );
      if (codeBlockElement && codeBlockElement.textContent) {
        // Extract text before the colon
        const match = codeBlockElement.textContent.match(/^([^:]+)/);
        if (match && match[1]) {
          exceptionMessage = match[1].trim();
        } else {
          exceptionMessage = codeBlockElement.textContent.trim();
        }
      }
    }

    // Extract Jira ID from span with badge-pill badge-default containing "QAAUT-"
    let jiraId = "";
    const badgeElements = testContainer.querySelectorAll(
      ".badge.badge-pill.badge-default"
    );
    badgeElements.forEach((element) => {
      const content = element.textContent || "";
      if (content.includes("QAAUT-")) {
        jiraId = content.trim();
      }
    });

    // Extract responsible QA from badge-pill elements (excluding those with "QAAUT-")
    const responsibleQAList: string[] = [];
    badgeElements.forEach((element) => {
      const content = element.textContent || "";
      if (!content.includes("QAAUT-") && 
          !content.includes("Supply") && 
          !content.includes("Demand") && 
          content.trim() !== "") {
        responsibleQAList.push(content.trim());
      }
    });
    const responsibleQA = responsibleQAList.join(', ');

    // Add to results array
    results.push({
      testName,
      scenario,
      status,
      failureStep,
      exceptionMessage,
      jiraId,
      responsibleQA,
      sessionId: "", // Not required for API analysis
      failureReason: "", // Not required for API analysis
    });
  });

  return results;
};

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

    // Extract Responsible QA from badge-pill
    const responsibleQAElement = testContainer.querySelector(".badge-pill");
    const responsibleQA = responsibleQAElement?.textContent?.trim() || "";

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
      // Extract failure step (last h4 with blue color)
      const failureStepElements = testContainer.querySelectorAll(
        "h4[style*='color: blue']"
      );
      if (failureStepElements.length > 0) {
        const lastFailureStepElement = failureStepElements[failureStepElements.length - 1];
        failureStep = lastFailureStepElement.textContent?.trim() || "";
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
      responsibleQA,
    });
  });

  return results;
};