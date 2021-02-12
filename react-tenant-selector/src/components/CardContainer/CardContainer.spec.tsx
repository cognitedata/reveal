import React from 'react';

import { render } from '../../utils/test';

import { Base, WithError } from './CardContainer.stories';

describe('<CardContainer />', () => {
  it('Should show AD login by default', () => {
    const { getByText } = render(<Base />);
    expect(getByText('Login with Microsoft Azure')).toBeInTheDocument();
  });

  it('Should show any errors', () => {
    const { getByText } = render(<WithError />);
    expect(getByText('This is just a storybook')).toBeInTheDocument();
  });
});
