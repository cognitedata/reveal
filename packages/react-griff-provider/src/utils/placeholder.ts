import { Domain } from '../types';

/**
 * Provide a placeholder domain so that we can test for validity later, but
 * it can be safely operated on like a real domain.
 */
export const placeholder = (min: number, max: number): Domain => {
  const domain: Domain = [min, max];
  domain.placeholder = true;
  return domain;
};
