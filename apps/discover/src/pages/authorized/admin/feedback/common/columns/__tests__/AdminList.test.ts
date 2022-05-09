import { fireEvent, screen } from '@testing-library/react';
import { UNKNOWN } from 'dataLayers/userManagementService/selectors/constants';
import { getMockUmsUsers } from 'services/userManagementService/__fixtures/umsUsers';

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
