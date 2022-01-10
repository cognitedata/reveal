import { MouseEvent } from 'react';

export const openInNewTab = (event: MouseEvent, links: string[]) => {
  event.preventDefault();
  links.forEach((link) => {
    window.open(link, '_blank');
  });
};
