import { fireEvent, screen } from '@testing-library/react';
import { CogniteAuth } from '@cognite/auth-utils';
import { CogniteClient } from '@cognite/sdk-v5';

import { render } from '../../utils/test';

import Base from './LoginWithADFS';

const getProps = () => {
  const client = new CogniteClient({ appId: 'test' });
  const authClient = new CogniteAuth(client);

  authClient.loginInitial = jest.fn();

  return { authClient };
};

describe('<LoginWithADFS />', () => {
  it('Should render the button', () => {
    render(<Base {...getProps()} />);
    expect(screen.getByText('Login with ADFS')).toBeInTheDocument();
  });

  it('Should trigger login on click', () => {
    const props = getProps();
    render(<Base {...props} />);

    fireEvent.click(screen.getByText('Login with ADFS'));
    expect(props.authClient.loginInitial).toBeCalledTimes(1);
    expect(props.authClient.loginInitial).toHaveBeenCalledWith({
      flow: 'ADFS',
    });
  });
});
