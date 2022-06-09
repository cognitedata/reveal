import { useUserRoles } from 'domain/user/internal/hooks/useUserRoles';

import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { Admin } from './Admin';

jest.mock('domain/user/internal/hooks/useUserRoles', () => ({
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
  const page = () => testRenderer(AdminTestComponent);

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
