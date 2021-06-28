import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'utils/test';
import { CapabilityCheck } from 'components/accessCheck/CapabilityCheck';
import { EXTPIPES_ACL_READ } from 'model/AclAction';
// eslint-disable-next-line
import { usePermissions } from '@cognite/sdk-react-query-hooks';

jest.mock('@cognite/sdk-react-query-hooks', () => {
  return {
    usePermissions: jest.fn(),
  };
});
describe('CapabilityCheck', () => {
  const text = 'Im the content';
  const content = <p>{text}</p>;
  test('Render content when permission is ok', () => {
    usePermissions.mockReturnValue({ isLoading: false, data: true });
    render(
      <CapabilityCheck requiredAccess={EXTPIPES_ACL_READ}>
        {content}
      </CapabilityCheck>
    );
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  test('Render error when permission is NOT ok', () => {
    usePermissions.mockReturnValue({ isLoading: false, data: false });
    render(
      <CapabilityCheck requiredAccess={EXTPIPES_ACL_READ}>
        {content}
      </CapabilityCheck>
    );
    expect(
      screen.getByText(`${EXTPIPES_ACL_READ.acl}:${EXTPIPES_ACL_READ.action}`)
    ).toBeInTheDocument();
  });
});
