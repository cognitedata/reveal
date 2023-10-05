/*!
 * Copyright 2023 Cognite AS
 */

export const getLanguage = (): string | undefined => {
  try {
    let systemLanguage = window.navigator.language;
    [systemLanguage] = systemLanguage.split('-'); // getting the part before dash for language codes like `en-us` and `fr-be`
    return systemLanguage;
  } catch {
    return undefined;
  }
};
