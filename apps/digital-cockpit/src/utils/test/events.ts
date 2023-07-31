import { fireEvent } from '@testing-library/react';

// tries to mimic the browser click, which actually focuses the DOM element -- https://github.com/testing-library/react-testing-library/issues/276
export const clickElement = (el: HTMLElement) => {
  fireEvent.click(el);
  fireEvent.focus(el);
  el.focus(); // this will actually set the document.activeElement property
};
