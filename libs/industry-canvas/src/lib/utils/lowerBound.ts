export const lowerBound = (numbers: number[], target: number): number => {
  let left = 0;
  let right = numbers.length;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (numbers[mid] < target) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
};
