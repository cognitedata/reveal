import { UNKNOWN } from 'domain/userManagementService/constants';
import { getMockUmsUsers } from 'domain/userManagementService/service/__fixtures/getMockUmsUsers';

import { fireEvent, screen } from '@testing-library/react';

import { testRendererModal } from '__test-utils/renderer';

import { INFO_MESSAGE } from '../../../constants';
import { AdminList } from '../AdminList';

describe('AdminList', () => {
  const assign = jest.fn();
  const umsList = getMockUmsUsers();

  afterAll(jest.clearAllMocks);

  const initiateTest = (props?: any) => {
    return testRendererModal(AdminList, undefined, props);
  };

  it('should render component correctly', async () => {
    await initiateTest({
      assign,
      adminList: umsList,
      assigneeId: 'testId_2',
    });

    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
    expect(screen.getByText('test name')).toBeInTheDocument();
    expect(screen.getByTestId('assigned-item')).toBeInTheDocument();
    expect(screen.getByText(UNKNOWN)).toBeInTheDocument();
    expect(screen.getByText(INFO_MESSAGE)).toBeInTheDocument();
  });

  it('should call the `assign` function with the user event', async () => {
    await initiateTest({
      assign,
      adminList: umsList,
      assigneeId: 'testId_2',
    });

    fireEvent.click(screen.getByText('test name'));
    expect(assign).toHaveBeenCalledTimes(1);
  });
});
