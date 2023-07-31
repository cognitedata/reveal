import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { GrayFilterTag } from '../GrayFilterTag';

describe('FilterTag', () => {
  const tag = 'test-tag';
  const onClick = jest.fn();

  const defaultProps = { tag, onClick };

  const defaultTestInit = async () => ({
    ...testRenderer(GrayFilterTag, undefined, defaultProps),
  });

  it('should render filter tag as expected', async () => {
    await defaultTestInit();
    expect(screen.getByText(tag)).toBeInTheDocument();
  });

  it('should call `onClick` once when the filter tag is clicked once', async () => {
    await defaultTestInit();

    fireEvent.click(screen.getByText(tag));
    expect(onClick).toBeCalledTimes(1);
  });
});
