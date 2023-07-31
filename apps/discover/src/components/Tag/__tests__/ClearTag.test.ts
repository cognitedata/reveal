import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { CLEAR_ALL_TEXT } from 'components/TableEmpty/constants';

import { ClearTag } from '../ClearTag';

describe('ClearTag', () => {
  const onClick = jest.fn();

  const defaultProps = { onClick };

  const defaultTestInit = async () => ({
    ...testRenderer(ClearTag, undefined, defaultProps),
  });

  it('should render clear tag as expected', async () => {
    await defaultTestInit();
    expect(screen.getByText(CLEAR_ALL_TEXT)).toBeInTheDocument();
  });

  it('should call `onClick` once when the clear tag is clicked once', async () => {
    await defaultTestInit();

    fireEvent.click(screen.getByText(CLEAR_ALL_TEXT));
    expect(onClick).toBeCalledTimes(1);
  });
});
