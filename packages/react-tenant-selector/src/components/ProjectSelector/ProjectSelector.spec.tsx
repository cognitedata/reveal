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
    enabled: true,
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
      data: [{ projectUrlName: 'test-1' }],
      isFetched: true,
      isError: false,
      refetch: jest.fn(),
    });

    render(<Base {...getProps()} />);
    expect(screen.getByText('test-1')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('Should handle network errors', () => {
    // @ts-expect-error - missing args
    sandbox.stub(reactQuery, 'useQuery').returns({
      data: [],
      isFetched: true,
      isError: true,
      refetch: jest.fn(),
    });

    render(<Base {...getProps()} />);
    expect(
      screen.getByText('There has been an error', { exact: false })
    ).toBeInTheDocument();
  });

  it('Should select a project', () => {
    // @ts-expect-error - missing args
    sandbox.stub(reactQuery, 'useQuery').returns({
      data: [{ projectUrlName: 'test-1' }],
      isFetched: true,
      isError: false,
      refetch: jest.fn(),
    });

    const props = getProps();

    render(<Base {...props} />);
    fireEvent.click(screen.getByText('Continue'));
    expect(props.onSelected).toBeCalledWith('test-1', '');
  });
});
