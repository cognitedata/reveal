import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { CogniteAuth } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';
import * as reactQuery from 'react-query';

import { render, sandbox } from '../../utils/test';

import Base from './ProjectSelector';

const getProps = () => {
  const client = new CogniteClient({ appId: 'test' });
  const authClient = new CogniteAuth(client);

  authClient.login = jest.fn();

  return {
    authClient,

    authState: {
      authenticated: false,
      initialising: false,
    },
    onSelected: jest.fn(),
  };
};

describe('<ProjectSelector />', () => {
  it('Should render the button', () => {
    // @ts-expect-error - missing args
    sandbox.stub(reactQuery, 'useQuery').returns({
      data: [{ urlName: 'test-1' }],
      isFetched: true,
      isError: false,
    });

    render(<Base {...getProps()} />);
    expect(screen.getByText('test-1')).toBeTruthy();
    expect(screen.getByText('Continue')).toBeTruthy();
  });

  it('Should handle network errors', () => {
    // @ts-expect-error - missing args
    sandbox.stub(reactQuery, 'useQuery').returns({
      data: [],
      isFetched: true,
      isError: true,
    });

    render(<Base {...getProps()} />);
    expect(
      screen.getByText('There has been an error', { exact: false })
    ).toBeTruthy();
  });

  it('Should select a project', () => {
    // @ts-expect-error - missing args
    sandbox.stub(reactQuery, 'useQuery').returns({
      data: [{ urlName: 'test-1' }],
      isFetched: true,
      isError: false,
    });

    const props = getProps();

    render(<Base {...props} />);
    fireEvent.click(screen.getByText('Continue'));
    expect(props.onSelected).toBeCalledWith('test-1', '');
  });
});
