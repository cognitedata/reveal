import { screen } from '@testing-library/react';
import React from 'react';

import { render } from '../../utils/test';

import {
  Base,
  WithError,
  WithoutLegacy,
  WithoutLegacyWithErrors,
} from './CardContainer.stories';

describe('<CardContainer />', () => {
  it('Should show AD login by default', () => {
    render(<Base />);
    expect(screen.getByText('Company ID:')).toBeInTheDocument();
    expect(screen.getByText('Login with Microsoft Azure')).toBeInTheDocument();
  });

  it('Should show any errors', () => {
    render(<WithError />);
    expect(screen.getByText('This is a login error')).toBeInTheDocument();
  });

  it('Should only show Azure login', () => {
    render(<WithoutLegacy />);
    expect(screen.queryByText('Company ID:')).not.toBeInTheDocument();
    expect(screen.getByText('Login with Microsoft Azure')).toBeInTheDocument();
  });

  it('Should show Azure login with an error', () => {
    render(<WithoutLegacyWithErrors />);
    expect(screen.getByText('There has been an error')).toBeInTheDocument();
  });
});
