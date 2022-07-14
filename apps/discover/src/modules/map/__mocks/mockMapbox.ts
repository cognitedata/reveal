import '@cognite/react-map/dist/mocks';

import { configureCacheMock } from '__test-utils/mockCache';

jest.mock('html2canvas', () => {
  return () =>
    Promise.resolve({
      toDataURL() {
        return '';
      },
    });
});

HTMLCanvasElement.prototype.getContext = jest.fn();

configureCacheMock();

export {};
