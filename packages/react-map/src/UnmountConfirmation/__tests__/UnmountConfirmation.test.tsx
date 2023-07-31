import { render, screen } from '@testing-library/react';
import { EXIT_DELETE_BUTTON_TEXT } from 'UnmountConfirmation/constants';

import {
  UnmountConfirmation,
  UnmountConfirmationProps,
} from '../UnmountConfirmation';

const defaultProps: UnmountConfirmationProps = {
  enabled: true,
  map: {
    // @ts-expect-error yup, not a map
    getContainer: () => [],
  },
};
describe('UnmountConfirmation modal', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const page = (props: UnmountConfirmationProps) =>
    render(<UnmountConfirmation {...props} />);

  const defaultTestInit = async (props: UnmountConfirmationProps) => {
    return { ...page(props) };
  };

  it('should display nothing by default', async () => {
    await defaultTestInit(defaultProps);
    const headerText = screen.queryByText(EXIT_DELETE_BUTTON_TEXT);
    expect(headerText).not.toBeInTheDocument();
  });
});
