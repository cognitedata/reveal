import { showWarningMessage } from '../components/Toast';

import { isSafeUrl } from './url/isSafeUrl';

export const openExternalPage = (
  url: string,
  showUnsafeWarning?: boolean
): void => {
  if (isSafeUrl(url)) {
    window.open(url, '_blank', 'noopener,noreferrer');
  } else {
    console.warn(`Tried to open an unsafe url: ${url}`);

    if (showUnsafeWarning) {
      showWarningMessage(`Tried to open an unsafe url: ${url}`);
    }
  }
};
