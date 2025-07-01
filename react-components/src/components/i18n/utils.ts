export const getLanguage = (): string | undefined => {
  try {
    let systemLanguage = window.navigator.language;
    // get only part before dash for language codes like `en-us` and `fr-be`
    [systemLanguage] = systemLanguage.split('-');
    return systemLanguage;
  } catch {
    return undefined;
  }
};
