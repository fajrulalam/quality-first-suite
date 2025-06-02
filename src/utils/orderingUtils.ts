import { TestData } from "./types";

/**
 * Orders test cases based on a custom order text
 * @param data Array of test data to order
 * @param orderText Text containing line-separated patterns for ordering
 * @returns Ordered array of test data
 */
export function orderTestCases(data: TestData[], orderText: string): TestData[] {
  if (!orderText.trim()) {
    // If no order text provided, return data as is
    return data;
  }

  // Split order text into lines and filter out empty lines
  const orderPriorities = orderText
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (orderPriorities.length === 0) {
    return data;
  }

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
