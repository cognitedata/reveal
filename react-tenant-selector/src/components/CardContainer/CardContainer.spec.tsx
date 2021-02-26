import { screen } from '@testing-library/react';
import React from 'react';

import { render } from '../../utils/test';

import { Base, WithError, WithoutLegacy } from './CardContainer.stories';

describe('<CardContainer />', () => {
  it('Should show AD login by default', () => {
    render(<Base />);
    expect(screen.getByText('Company ID:')).toBeInTheDocument();
    expect(screen.getByText('Login with Microsoft Azure')).toBeInTheDocument();
  });

  it('Should show any errors', () => {
    render(<WithError />);
    expect(screen.getByText('This is just a storybook')).toBeInTheDocument();
  });

  it('Should only show Azure login', () => {
    render(<WithoutLegacy />);
    expect(screen.queryByText('Company ID:')).not.toBeInTheDocument();
    expect(screen.getByText('Login with Microsoft Azure')).toBeInTheDocument();
  });
});
