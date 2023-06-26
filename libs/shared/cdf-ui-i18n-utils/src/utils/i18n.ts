import { SELECTED_LANGUAGE_LS_KEY } from '../common/constants';

export const getLanguage = (): string | undefined => {
  try {
    const selectedLanguage = localStorage.getItem(SELECTED_LANGUAGE_LS_KEY);
    if (selectedLanguage) {
      return selectedLanguage;
    }

    let systemLanguage = window.navigator.language;
    [systemLanguage] = systemLanguage.split('-'); // getting the part before dash for language codes like `en-us` and `fr-be`
    return systemLanguage;
  } catch {
    return undefined;
  }
};

export const selectLanguage = (language: string) => {
  try {
    const selectedLanguage = getLanguage();
    if (selectedLanguage !== language) {
      localStorage.setItem(SELECTED_LANGUAGE_LS_KEY, language);
      window.location.reload();
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('An error has occured while setting the language', e);
  }
};
