import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { ScrollButtons, Props } from '../ScrollButtons';

describe('Scroll Buttons', () => {
  const defaultTestInit = async (viewProps: Props) => {
    return { ...testRenderer(ScrollButtons, undefined, viewProps) };
  };

  it(`should trigger scroll on button click`, async () => {
    const scrollElement = document.createElement('div');
    scrollElement.setAttribute('style', 'width:50px; height:10px;');
    scrollElement.scrollTo = jest.fn();
    scrollElement.setAttribute('data-testid', 'scroll-element');
    const childElement = document.createElement('div');
    childElement.setAttribute('style', 'width:500px; height:5px;');
    scrollElement.appendChild(childElement);

    const props = {
      scrollRef: {
        current: scrollElement,
      },
    };
    await defaultTestInit(props);
    fireEvent.click(screen.getByTestId('scroll-next'));
    expect(scrollElement.scrollTo).toBeCalledTimes(1);
    fireEvent.click(screen.getByTestId('scroll-prev'));
    expect(scrollElement.scrollTo).toBeCalledTimes(2);
  });
});
