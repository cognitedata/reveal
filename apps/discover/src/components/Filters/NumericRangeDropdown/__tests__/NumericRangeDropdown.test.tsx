import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import {
  NumericRangeDropdownProps,
  NumericRangeDropdown,
} from '../NumericRangeDropdown';

describe('NumericRangeDropdown', () => {
  const getDefaultProps = (): NumericRangeDropdownProps => ({
    title: 'TEST_TITLE',
    range: [10, 20],
    onChange: jest.fn(),
  });

  const testInit = (props: NumericRangeDropdownProps = getDefaultProps()) =>
    testRenderer(NumericRangeDropdown, undefined, props);

  it('should render dropdown menu once clicked on the label', async () => {
    const props = getDefaultProps();
    testInit(props);

    fireEvent.click(screen.getByRole('button'));

    screen.getByText(props.title, { exact: false });
    screen.getByText(props.range[0]);
    screen.getByText(props.range[1]);
  });
});
