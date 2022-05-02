import { fireEvent, render, screen } from '@testing-library/react';

import Histogram from '../Histogram';

describe('header', () => {
  const name = 'Document Type';
  const key = 'DocumentTypeTestKey';
  const toggleFilter = jest.fn();

  const defaultTestInit = () => {
    render(
      <Histogram
        options={{ selected: true, key, name, count: 10, total: 100 }}
        toggleFilter={toggleFilter}
      />
    );
  };

  it('should display hostogram values', () => {
    defaultTestInit();
    expect(screen.getByText(name)).toBeInTheDocument();
  });

  it(`should trigger 'toggleFilter' callback on click`, async () => {
    await defaultTestInit();
    const button = screen.getByTestId('histogram-btn');
    if (button) {
      fireEvent.click(button);
    }
    expect(toggleFilter).toBeCalledWith(key);
  });
});
