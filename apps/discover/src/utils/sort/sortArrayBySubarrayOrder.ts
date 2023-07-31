/**
 * Sort the array by the order of subarray elements.
 * Subarray should be a subset of the array
 *
 * @example
 * @array [5, 3, 2, 4, 1]
 * @subarray [4, 3, 2]
 * @returns [5, 4, 3, 2, 1]
 */
export const sortArrayBySubarrayOrder = <T>(array: T[], subArray: T[]) => {
  /**
   * Spreading the array to change the reference.
   * Otherwise, side effects are not triggered if the array is a constant.
   */
  return [...array].sort((a, b) => {
    const indexOfA = subArray.indexOf(a);
    const indexOfB = subArray.indexOf(b);

    if (indexOfA < 0 || indexOfB < 0) {
      return 0;
    }

    return indexOfA - indexOfB;
  });
};
