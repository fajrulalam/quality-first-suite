import { TestData } from "./types";

/**
 * Orders test cases based on a custom order text
 * @param data Array of test data to order
 * @param orderText Text containing line-separated patterns/names for ordering
 * @param matchOrderExactly If true, matches test names exactly and preserves duplicates from orderText.
 *                          If false, uses pattern matching and prioritizes based on first match.
 * @returns Ordered array of test data
 */
export function orderTestCases(
  data: TestData[],
  orderText: string,
  matchOrderExactly: boolean = false
): TestData[] {
  // Helper to get the base name for consistent comparison (e.g., "addProtection" from "addProtection_123")
  const getBaseTestName = (testName: string) => testName.split("_")[0];

  if (!orderText.trim()) {
    if (matchOrderExactly) {
      // If exact matching is on but no order text, sort all data alphabetically by base name
      return [...data].sort((a, b) =>
        getBaseTestName(a.testName).localeCompare(getBaseTestName(b.testName))
      );
    }
    // For pattern matching with no order text, return data as is
    return data;
  }

  const orderLines = orderText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (orderLines.length === 0) {
    if (matchOrderExactly) {
      // If order text is empty after processing, sort all data alphabetically by base name
      return [...data].sort((a, b) =>
        getBaseTestName(a.testName).localeCompare(getBaseTestName(b.testName))
      );
    }
    return data;
  }

  if (matchOrderExactly) {
    // New exact ordering logic
    const orderedResult: TestData[] = [];
    const availableTests: TestData[] = [...data]; // Create a mutable copy

    for (const nameInOrder of orderLines) {
      const matchIndex = availableTests.findIndex(
        (test) => getBaseTestName(test.testName) === nameInOrder
      );

      if (matchIndex !== -1) {
        // A matching test was found, add it to the result
        orderedResult.push(availableTests[matchIndex]);
        // Remove it from the available pool to handle duplicates correctly
        availableTests.splice(matchIndex, 1);
      } else {
        // No matching test was found, create a placeholder row
        orderedResult.push({
          testName: nameInOrder,
          status: "",
          sessionId: "",
          failureStep: "",
          exceptionMessage: "",
          failureReason: "",
          passedIn: "",
          issueType: "",
          rootCause: "",
        });
      }
    }
    // Return only the tests corresponding to orderText, discarding any others
    return orderedResult;
  } else {
    // Original pattern-matching logic, updated for base name comparison
    const orderPriorities = orderLines;
    const testPriorityMap = new Map<string, number>();

    data.forEach((test) => {
      const priorityIndex = orderPriorities.findIndex((pattern) =>
        getBaseTestName(test.testName).includes(pattern)
      );
      testPriorityMap.set(
        test.testName,
        priorityIndex >= 0 ? priorityIndex : orderPriorities.length
      );
    });

    return [...data].sort((a, b) => {
      const priorityA =
        testPriorityMap.get(a.testName) ?? orderPriorities.length;
      const priorityB =
        testPriorityMap.get(b.testName) ?? orderPriorities.length;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      // For tests with the same priority, sort alphabetically by base name
      return getBaseTestName(a.testName).localeCompare(
        getBaseTestName(b.testName)
      );
    });
  }
}
