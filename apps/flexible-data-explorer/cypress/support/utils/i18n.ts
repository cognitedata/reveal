import { english } from '../app';

export const resolveTranslation = (key: keyof typeof english): string => {
  return english[key];
};
