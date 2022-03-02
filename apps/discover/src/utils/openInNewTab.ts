import { MouseEvent } from 'react';

import { openExternalPage } from './url';

export const openInNewTab = (event: MouseEvent, links: string[]) => {
  event.preventDefault();
  links.forEach((link) => {
    openExternalPage(link);
  });
};
