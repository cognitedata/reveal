import { fireEvent, screen } from '@testing-library/react';
import { CogniteAuth } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk';
import * as reactQuery from 'react-query';

import { render, sandbox } from '../../utils/test';

import Base, { ProjectResult } from './ProjectSelector';

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
    const data: ProjectResult[] = [{ projectUrlName: 'test-1', groups: [1] }];

    // @ts-expect-error - missing args
    sandbox.stub(reactQuery, 'useQuery').returns({
      data,
      isFetched: true,
      isError: false,
      refetch: jest.fn(),
    });

    render(<Base {...getProps()} />);
    expect(screen.getByText('test-1')).toBeInTheDocument();
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('Should show only projects we have groups in', () => {
    const data: ProjectResult[] = [
      {
        projectUrlName: 'test-1',
        groups: [1],
      },
      {
        projectUrlName: 'test-2',
        groups: [],
      },
    ];

    // @ts-expect-error - missing useQuery args
    sandbox.stub(reactQuery, 'useQuery').returns({
      data,
      isFetched: true,
      isError: false,
      refetch: jest.fn(),
    });

    render(<Base {...getProps()} />);

    fireEvent.click(screen.getByText('Select a project'));

    expect(screen.getByText('test-1')).toBeInTheDocument();
    expect(screen.queryByText('test-2')).not.toBeInTheDocument();
  });

  it('Should handle network errors', () => {
    const data: ProjectResult[] = [];

    // @ts-expect-error - missing args
    sandbox.stub(reactQuery, 'useQuery').returns({
      data,
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
    const data: ProjectResult[] = [{ projectUrlName: 'test-1', groups: [1] }];

    // @ts-expect-error - missing args
    sandbox.stub(reactQuery, 'useQuery').returns({
      data,
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
