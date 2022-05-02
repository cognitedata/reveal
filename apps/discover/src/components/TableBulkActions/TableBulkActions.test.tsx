import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { ViewButton } from 'components/Buttons';

import TableBulkActions from './TableBulkActions';

const TEST_TOOLTIP = 'TEST_TOOLTIP';
const TEST_BUTTON_TEXT = 'TEST_BUTTON_TEXT';
const TEST_ARIA_LABEL = 'TEST_ARIA_LABEL';
const TEST_COUNT = 2;
const TEST_TITLE = `${TEST_COUNT} selected`;

const onClick = jest.fn();

const TableBulkActionsComponent = ({ ...rest }) => {
  return (
    <TableBulkActions isVisible={!!TEST_COUNT} title={TEST_TITLE} {...rest}>
      <ViewButton
        variant="inverted"
        text={TEST_BUTTON_TEXT}
        tooltip={TEST_TOOLTIP}
        onClick={onClick}
        aria-label={TEST_ARIA_LABEL}
      />
    </TableBulkActions>
  );
};

describe('TableBulkActions Tests', () => {
  const testInit = async (viewProps?: any) =>
    testRenderer(TableBulkActionsComponent, undefined, viewProps);

  it('should render component content and count', () => {
    testInit();
    expect(screen.getByText(TEST_TITLE)).toBeInTheDocument();
    expect(screen.getByText(TEST_BUTTON_TEXT)).toBeInTheDocument();
  });
});
