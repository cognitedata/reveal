import { TFunction } from '../hooks';

export const mockTranslation: TFunction = (
  _: string,
  fallbackValue: string
) => {
  return fallbackValue;
};
