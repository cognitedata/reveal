import { CurveSuffix } from '../types';

export const getCurveSuffixPrecedence = (suffix: string) => {
  switch (suffix) {
    case CurveSuffix.LOW:
      return 1;
    case CurveSuffix.ML:
      return 2;
    case CurveSuffix.HIGH:
      return 3;
    default:
      return null;
  }
};
