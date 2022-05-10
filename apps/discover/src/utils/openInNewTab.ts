import { MouseEvent } from 'react';

import { openExternalPage } from './openExternalPage';

export const openInNewTab = (event: MouseEvent, links: string[]) => {
  event.preventDefault();
  links.forEach((link) => {
    openExternalPage(link);
  });
};
