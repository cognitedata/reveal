import React from 'react';
import { fireEvent } from '@testing-library/react';
import { render } from 'utils/test';

import { act } from 'react-dom/test-utils';
import { Base } from './CardContainer.stories';

describe('<CardContainer />', () => {
  it('Should show tenant selector by default', () => {
    const { getByText } = render(<Base />);
    expect(getByText('Specify cluster')).toBeInTheDocument();
  });

  it('Should switch between cluster and tenant selectors on [Specify cluster] and [Back] buttons click', () => {
    const { getByText } = render(<Base />);
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

  it('Should sanitize tenant on input change', () => {
    const { getByPlaceholderText } = render(<Base />);

    const tenantInput = getByPlaceholderText(
      'Enter Company ID'
    ) as HTMLInputElement;
    act(() => {
      fireEvent.change(tenantInput, { target: { value: 'AKERBP_' } });
    });
    expect(tenantInput.value).toEqual('akerbp');
  });
});
