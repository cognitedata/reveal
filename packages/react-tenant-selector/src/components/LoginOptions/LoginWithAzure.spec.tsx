import { fireEvent, screen } from '@testing-library/react';
import { CogniteAuth } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk-v5';

import { render } from '../../utils/test';

import Base from './LoginWithAzure';

const getProps = () => {
  const client = new CogniteClient({ appId: 'test' });
  const authClient = new CogniteAuth(client);

  authClient.loginInitial = jest.fn();

  return { cluster: 'test', authClient };
};

describe('<LoginWithAzure />', () => {
  it('Should render the button', () => {
    render(<Base {...getProps()} />);
    expect(screen.getByText('Login with Microsoft Azure')).toBeInTheDocument();
  });

  it('Should trigger login on click', () => {
    const props = getProps();
    render(<Base {...props} />);

    fireEvent.click(screen.getByText('Login with Microsoft Azure'));
    expect(props.authClient.loginInitial).toBeCalledTimes(1);
    expect(props.authClient.loginInitial).toHaveBeenCalledWith({
      flow: 'AZURE_AD',
      directory: undefined,
    });
  });

  it('Should trigger login on click with directory', () => {
    const props = getProps();
    render(<Base {...props} />);

    fireEvent.click(screen.getByText('Advanced Azure options'));
    const input = screen.getByPlaceholderText(
      'ID or name, Eg: myproject.onmicrosoft.com'
    );
    fireEvent.change(input, { target: { value: 'test-directory' } });

    fireEvent.click(screen.getByText('Login with Microsoft Azure'));
    expect(props.authClient.loginInitial).toBeCalledTimes(1);
    expect(props.authClient.loginInitial).toHaveBeenCalledWith({
      flow: 'AZURE_AD',
      directory: 'test-directory',
    });
  });
});
