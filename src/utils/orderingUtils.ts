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
  if (!orderText.trim()) {
    if (matchOrderExactly) {
      // If matchOrderExactly is true and no order text provided, sort alphabetically
      return [...data].sort((a, b) => a.testName.localeCompare(b.testName));
    }
    // If matchOrderExactly is false and no order text provided, return data as is (original behavior)
    return data;
  }

  // Split order text into lines and filter out empty lines
  const orderLines = orderText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (orderLines.length === 0) {
    if (matchOrderExactly) {
      // If matchOrderExactly is true and no valid order lines, sort alphabetically
      return [...data].sort((a, b) => a.testName.localeCompare(b.testName));
    }
    // If matchOrderExactly is false and no valid order lines, return original data (original behavior)
    return data;
  }

  if (matchOrderExactly) {
    // Exact ordering mode
    const orderedResult: TestData[] = [];
    const availableTests: TestData[] = [...data]; // Create a mutable copy to track which tests have been used

    // Follow the exact ordering in orderLines
    for (const nameInOrder of orderLines) {
      // Find the first available test with matching name
      const matchIndex = availableTests.findIndex(
        test => test.testName === nameInOrder
      );

      if (matchIndex !== -1) {
        // Add the test to the result in order
        orderedResult.push(availableTests[matchIndex]);
        // Remove it from available tests to handle duplicates correctly
        availableTests.splice(matchIndex, 1);
      }
      // Skip lines from orderText that don't match any available tests
    }

    // Append any remaining tests that weren't in orderLines, sorted alphabetically
    availableTests.sort((a, b) => a.testName.localeCompare(b.testName));
    return [...orderedResult, ...availableTests];
  } else {
    // Original pattern-matching mode
    const orderPriorities = orderLines;

    // Create a map to track which priority each test belongs to
    const testPriorityMap = new Map<string, number>();

    // Assign priority to each test based on the first matching pattern
    data.forEach(test => {
      const priorityIndex = orderPriorities.findIndex(pattern => 
        test.testName.includes(pattern)
      );
      
      // If test matches a pattern, assign its priority index, otherwise set to a high number
      testPriorityMap.set(test.testName, priorityIndex >= 0 ? priorityIndex : orderPriorities.length);
    });

    // Sort the data based on priority and then alphabetically for tests with same priority
    return [...data].sort((a, b) => {
      const priorityA = testPriorityMap.get(a.testName) ?? orderPriorities.length;
      const priorityB = testPriorityMap.get(b.testName) ?? orderPriorities.length;

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // If same priority, sort alphabetically
      return a.testName.localeCompare(b.testName);
    });
  }
}
