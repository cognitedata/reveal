export const isOfType = <T>(
  varToBeChecked: any,
  propertyToCheckFor: keyof T
): varToBeChecked is T =>
  (varToBeChecked as T)[propertyToCheckFor] !== undefined;

/**
 * Extract element type of an array
 */
export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never;
