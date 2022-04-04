import { HttpStatus } from './types';

export const convertToHttpStatus = (value: number | HttpStatus): HttpStatus => {
  if (value >= 200 || value <= 500) {
    return value as HttpStatus;
  }

  return 500;
};
