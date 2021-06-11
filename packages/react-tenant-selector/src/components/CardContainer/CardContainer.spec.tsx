import { screen } from '@testing-library/react';
import React from 'react';
import { QueryClientProvider, QueryClient } from 'react-query';

import { render } from '../../utils/test';

import {
  Base,
  WithError,
  WithoutLegacy,
  WithoutLegacyWithErrors,
} from './CardContainer.stories';

const cache = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      retry: false,
    },
  },
});

export const wrapper = (Story: () => React.ReactElement) => (
  <QueryClientProvider client={cache}>
    <Story />
  </QueryClientProvider>
);

describe('<CardContainer />', () => {
  it('Should show AD login by default', () => {
    render(wrapper(Base));
    expect(screen.getByText('Log in to:')).toBeInTheDocument();
    expect(screen.getByText('test-name')).toBeInTheDocument();

    expect(screen.getByText('Company ID:')).toBeInTheDocument();
    expect(screen.getByText('Login with Microsoft Azure')).toBeInTheDocument();
  });

  it('Should show any errors', () => {
    render(wrapper(WithError));
    expect(screen.getByText('This is a login error')).toBeInTheDocument();
  });

  it('Should only show Azure login', () => {
    render(wrapper(WithoutLegacy));
    expect(screen.queryByText('Company ID:')).not.toBeInTheDocument();
    expect(screen.getByText('Login with Microsoft Azure')).toBeInTheDocument();
  });

  it('Should show Azure login with an error', () => {
    render(wrapper(WithoutLegacyWithErrors));
    expect(screen.getByText('There has been an error')).toBeInTheDocument();
  });
});
