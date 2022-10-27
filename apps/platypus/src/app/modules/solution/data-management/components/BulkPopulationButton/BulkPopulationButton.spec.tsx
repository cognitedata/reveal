import { screen } from '@testing-library/react';
import render from '@platypus-app/tests/render';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { BulkPopulationButton } from './BulkPopulationButton';

const mockGetMissingPermissions = jest.fn();

jest.mock(
  '@platypus-app/modules/solution/data-management/hooks/useDataManagemenPageUI',
  () => ({
    useDataManagementPageUI: () => ({
      getMissingPermissions: mockGetMissingPermissions,
    }),
  })
);

describe('BulkPopulationButton', () => {
  it('disables button if there are missing permissions', () => {
    mockGetMissingPermissions.mockImplementation(() => ['foo']);
    const onClick = jest.fn();

    render(<BulkPopulationButton onClick={onClick}>Load</BulkPopulationButton>);

    userEvent.click(screen.getByRole('button'));

    expect(onClick).not.toHaveBeenCalled();
  });

  it('does not show tooltip if there are no missing permissions', () => {
    mockGetMissingPermissions.mockImplementation(() => []);

    render(<BulkPopulationButton>Load</BulkPopulationButton>);

    userEvent.hover(screen.getByRole('button'));

    expect(screen.queryByText(/You do not have enough permissions/)).toBeNull();
  });

  it('button is enabled if there are no missing permissions', () => {
    mockGetMissingPermissions.mockImplementation(() => []);
    const onClick = jest.fn();

    render(<BulkPopulationButton onClick={onClick}>Load</BulkPopulationButton>);

    userEvent.click(screen.getByRole('button'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
