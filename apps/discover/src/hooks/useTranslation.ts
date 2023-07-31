/**
 * This hooks replaces the one from `react-i18n` in case we ever want to enable back translations, and so we don't have to remove it everywhere in the code right away
 * */

export const useTranslation = (_namespace?: string) => {
  return {
    t: (text: string) => text,
  };
};
