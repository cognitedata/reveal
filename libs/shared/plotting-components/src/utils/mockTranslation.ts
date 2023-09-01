import { TFunction } from '../useTranslation';

export const mockTranslation: TFunction = (
  _: string,
  fallbackValue: string
) => {
  return fallbackValue;
};
