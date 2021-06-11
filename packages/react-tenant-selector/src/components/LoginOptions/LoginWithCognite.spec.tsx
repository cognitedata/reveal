import { fireEvent, act, screen } from '@testing-library/react';

import { render } from '../../utils/test';

import Base from './LoginWithCognite';

const props = {
  cluster: '',
  initialTenant: '',
  loading: false,
  handleSubmit: jest.fn(),
  handleClusterSubmit: jest.fn(),
  validateTenant: jest.fn(),
  validateCluster: jest.fn(),
  errors: [],
  // authClient,
};

describe('<LoginWithCognite />', () => {
  it('Should sanitize tenant on input change', () => {
    render(<Base {...props} />);

    const tenantInput = screen.getByPlaceholderText(
      'Enter Company ID'
    ) as HTMLInputElement;
    act(() => {
      fireEvent.change(tenantInput, { target: { value: 'AKERBP_' } });
    });
    expect(tenantInput.value).toEqual('akerbp');
  });

  it('Should switch between cluster and tenant selectors on [Specify Cluster] and [Back] buttons click', () => {
    render(<Base {...props} />);
    const toClusterButton = screen.getByText(
      'Specify Cluster'
    ) as HTMLButtonElement;
    act(() => {
      fireEvent.click(toClusterButton);
    });
    const backToTenantButton = screen.getByText('Back') as HTMLButtonElement;
    act(() => {
      fireEvent.click(backToTenantButton);
    });
    expect(screen.getByText('Specify Cluster')).toBeInTheDocument();
  });
});
