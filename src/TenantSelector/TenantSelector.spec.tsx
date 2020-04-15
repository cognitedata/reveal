import React from 'react';
import { render, typeText } from 'test/utils';

import { Base, Loading } from './TenantSelector.stories';

describe('<TenantSelector />', () => {
  it('Should auto-focus on page render', async () => {
    const { queryByPlaceholderText } = render(<Base />);
    expect(queryByPlaceholderText('Enter Company ID')).toHaveFocus();
  });

  it('Should sanitize tenant on input change', () => {
    const { getByPlaceholderText } = render(<Base />);

    const tenantInput = getByPlaceholderText(
      'Enter Company ID'
    ) as HTMLInputElement;
    typeText(tenantInput, 'AKERBP_');
    expect(tenantInput.value).toEqual('akerbp');
  });

  it('Should be disabled while loading', async () => {
    const { queryByPlaceholderText } = render(<Loading />);
    expect(queryByPlaceholderText('Enter Company ID')).toBeDisabled();
  });
});
