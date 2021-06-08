// this mock makes sure any components using the translate hook can use it without a warning being shown
export const useTranslation = () => {
  return {
    t: (str: string, options?: { defaultValue: string }) =>
      options ? options.defaultValue : str,
    i18n: {
      // changeLanguage: () => new Promise(() => {}),
    },
  };
};
