import React from 'react';
import { fireEvent, act } from '@testing-library/react';
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
    const { getByPlaceholderText } = render(<Base {...props} />);

    const tenantInput = getByPlaceholderText(
      'Enter Company ID'
    ) as HTMLInputElement;
    act(() => {
      fireEvent.change(tenantInput, { target: { value: 'AKERBP_' } });
    });
    expect(tenantInput.value).toEqual('akerbp');
  });

  it('Should switch between cluster and tenant selectors on [Specify cluster] and [Back] buttons click', () => {
    const { getByText } = render(<Base {...props} />);
    const toClusterButton = getByText('Specify cluster') as HTMLButtonElement;
    act(() => {
      fireEvent.click(toClusterButton);
    });
    const backToTenantButton = getByText('Back') as HTMLButtonElement;
    act(() => {
      fireEvent.click(backToTenantButton);
    });
    expect(getByText('Specify cluster')).toBeInTheDocument();
  });
});
