const COMMITTED_PAGE_KEY = '@cognite/login/committedPage';

// This is used to remember the page from where the AD login happened
// such that on return to this app without a code/token (in case of error)
// we know on which page to display the error message
export const commitLoginPage = (
  page: 'signInWithMicrosoft' | 'signInWithAsGuest' | null
) => {
  if (page) {
    window.localStorage.setItem(COMMITTED_PAGE_KEY, page!);
  } else {
    window.localStorage.removeItem(COMMITTED_PAGE_KEY);
  }
};

export const getCommittedPage = () => {
  const page = window.localStorage.getItem(COMMITTED_PAGE_KEY);
  return page || '/';
};

export const isLoginError = () =>
  window.location.hash.includes('error=invalid_client');

export const hasTokenOrCode = (AZURE_APP_ID: string) => {
  const accountLocalId = window.localStorage.getItem(
    '@cognite/sdk:accountLocalId'
  );
  const urlHash = window.sessionStorage.getItem(`msal.${AZURE_APP_ID}.urlHash`);

  // If accountLocalId si present then user is connected from previous sessions
  // If location includes code= then user just navigated from msft login
  // If session storage urlHash contains code= then login is in progress
  return (
    accountLocalId ||
    window.location.hash.includes('code=') ||
    urlHash?.includes('code=')
  );
};

export const clearMsalStatus = (AZURE_APP_ID: string) => {
  window.sessionStorage.removeItem(`msal.${AZURE_APP_ID}.interaction.status`);
};

export const clearUrlHash = () => {
  window.history.pushState('', document.title, window.location.pathname);
};

export const removeAzureTokensFromLS = () => {
  Object.keys(window.localStorage)
    .filter((k) => k.includes('login.windows.net'))
    .forEach((key) => localStorage.removeItem(key));
};
