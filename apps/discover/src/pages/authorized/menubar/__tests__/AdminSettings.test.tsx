import { fireEvent, screen } from '@testing-library/react';
import { Store } from 'redux';
import { useUserRoles } from 'services/user/useUserQuery';

import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { useProjectConfigByKey } from 'hooks/useProjectConfig';

import { AdminSettings } from '../AdminSettings';
import { PATHNAMES } from '../Topbar';

jest.mock('services/user/useUserQuery', () => ({
  useUserRoles: jest.fn(),
}));

jest.mock('@cognite/react-feature-flags', () => ({
  useFlag: () => true,
}));

jest.mock('hooks/useProjectConfig', () => ({
  useProjectConfigByKey: jest.fn(),
}));

interface props {
  PATHNAMES: typeof PATHNAMES;
  handleNavigation: (navigation: string, path: number) => void;
}

describe('Admin Settings', () => {
  const defaultTestInit = async (props: props) => {
    const store: Store = getMockedStore();
    return testRendererModal(AdminSettings, store, props);
  };

  it('should render `Admin Settings` drop-down when `isAdmin` is true', async () => {
    (useUserRoles as jest.Mock).mockImplementation(() => ({
      data: { isAdmin: true },
    }));
    (useProjectConfigByKey as jest.Mock).mockImplementation(() => ({
      data: {
        showProjectConfig: false,
      },
    }));

    await defaultTestInit({
      PATHNAMES,
      handleNavigation: jest.fn(),
    });
    expect(screen.getByText('Admin Settings')).toBeInTheDocument();
  });

  it('should not render `Admin Settings` when `isAdmin` is false', async () => {
    (useUserRoles as jest.Mock).mockImplementation(() => ({
      data: { isAdmin: false },
    }));
    (useProjectConfigByKey as jest.Mock).mockImplementation(() => ({
      data: {
        showProjectConfig: false,
      },
    }));

    await defaultTestInit({
      PATHNAMES,
      handleNavigation: jest.fn(),
    });

    expect(screen.queryByText('Admin Settings')).not.toBeInTheDocument();
  });

  it('should render drop-down items when click `Admin Settings`', async () => {
    (useUserRoles as jest.Mock).mockImplementation(() => ({
      data: { isAdmin: true },
    }));
    (useProjectConfigByKey as jest.Mock).mockImplementation(() => ({
      data: {
        showProjectConfig: true,
      },
    }));

    await defaultTestInit({
      PATHNAMES,
      handleNavigation: jest.fn(),
    });

    fireEvent.click(screen.getByText('Admin Settings'));
    expect(screen.getByText('Manage Feedback')).toBeInTheDocument();
    expect(screen.getByText('Manage Layers')).toBeInTheDocument();
    expect(screen.getByText('Manage Project Config')).toBeInTheDocument();
  });

  it('should not render drop-down item `Manage Project Config` when `showProjectConfig` is false', async () => {
    (useUserRoles as jest.Mock).mockImplementation(() => ({
      data: { isAdmin: true },
    }));
    (useProjectConfigByKey as jest.Mock).mockImplementation(() => ({
      data: {
        showProjectConfig: false,
      },
    }));

    await defaultTestInit({
      PATHNAMES,
      handleNavigation: jest.fn(),
    });

    fireEvent.click(screen.getByText('Admin Settings'));
    expect(screen.queryByText('Manage Project Config')).not.toBeInTheDocument();
  });
});
