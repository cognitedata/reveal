import React from 'react';

import { render } from '../../utils/test';

import { Base } from './CardContainer.stories';

describe('<CardContainer />', () => {
  it('Should show AD login by default', () => {
    const { getByText } = render(<Base />);
    expect(getByText('Login with Microsoft Azure')).toBeInTheDocument();
  });
});
