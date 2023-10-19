export const sortAlphanumeric = (valueA: string, valueB: string) => {
  const numA = parseFloat(valueA);
  const numB = parseFloat(valueB);

  // Both are valid numbers, compare them numerically
  if (!isNaN(numA) && !isNaN(numB)) {
    return numA - numB;
  }

  // If only 'valueA' is a number, so it comes before 'valueB'
  if (!isNaN(numA)) {
    return -1;
  }

  // If only 'valueB' is a number, so it comes before 'valueA'
  if (!isNaN(numB)) {
    return 1;
  }

  // Both are not numbers, compare them as strings
  return valueA.localeCompare(valueB);
};
