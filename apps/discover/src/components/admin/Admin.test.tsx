import { screen } from '@testing-library/react';
import { useUserRoles } from 'services/user/useUserQuery';

import { testRenderer } from '__test-utils/renderer';

import { Admin } from './Admin';

jest.mock('services/user/useUserQuery', () => ({
  useUserRoles: jest.fn(),
}));

const AdminTestComponent = () => {
  return (
    <Admin>
      <div>test content</div>
    </Admin>
  );
};

describe('Admin', () => {
  const page = (viewProps?: any) =>
    testRenderer(AdminTestComponent, undefined, viewProps);

  const defaultTestInit = async () => {
    return { ...page() };
  };

  it(`should render children since user is admin`, async () => {
    (useUserRoles as jest.Mock).mockImplementation(() => ({
      data: { isAdmin: true },
    }));

    await defaultTestInit();

    expect(screen.getByText('test content')).toBeInTheDocument();
  });

  it(`shouldn't render children since user isn't admin`, async () => {
    (useUserRoles as jest.Mock).mockImplementation(() => ({
      data: { isAdmin: false },
    }));

    await defaultTestInit();

    expect(screen.queryByText('test content')).not.toBeInTheDocument();
  });
});
