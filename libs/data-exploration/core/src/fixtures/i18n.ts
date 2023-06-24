import { TFunction } from '../hooks';

export const mockTFunction: TFunction = (
  _key: string,
  referenceValue: string,
  _options?: {}
) => {
  return referenceValue;
};
