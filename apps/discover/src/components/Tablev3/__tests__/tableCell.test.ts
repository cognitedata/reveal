import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { TableCell } from '../TableCell';

const TEST_TOOLTIP = 'Test tooltip';

jest.mock('components/Tooltip', () => ({
  Tooltip: () => TEST_TOOLTIP,
}));

describe('Table cell', () => {
  const renderPage = async (value: any) =>
    testRenderer(TableCell, undefined, {
      cell: {
        value: 'test',
        render: () => ({
          props: {
            value,
            column: {
              displayFullText: false,
            },
          },
        }),
      },
    });

  test('should render tooltip when cell value is defined and a string', async () => {
    await renderPage('test');
    expect(screen.getByText(TEST_TOOLTIP)).toBeInTheDocument();
  });

  test('should render tooltip when cell value is defined and a number', async () => {
    await renderPage(5);
    expect(screen.getByText(TEST_TOOLTIP)).toBeInTheDocument();
  });

  test('should not render tooltip when cell value is empty', async () => {
    await renderPage('');
    expect(screen.queryByText(TEST_TOOLTIP)).not.toBeInTheDocument();
  });
});
