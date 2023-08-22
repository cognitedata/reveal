import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { Section } from 'types';

import * as featureFlags from '@cognite/react-feature-flags';

import { SectionWrapper } from './Menu';

jest.mock('@cognite/cdf-sdk-singleton', () => ({
  getFlow: () => '',
}));

jest.mock('@cognite/cdf-utilities', () => ({
  getCluster: () => '',
  createLink: jest.fn(),
  isUsingUnifiedSignin: () => false,
}));

jest.mock('../../../../i18n', () => ({
  useTranslation: () => ({
    t: () => 'i18n string',
  }),
}));

const experimentalFlags: string[] = [];

function mockUseFlagToHideTag(flagName: string) {
  const response = {
    isEnabled: false,
    isClientReady: undefined,
  };
  if (
    !!experimentalFlags.find((experimental) => experimental === flagName) ||
    flagName === 'HIDE_EXPERIMENTAL_TAGS'
  ) {
    return {
      ...response,
      isEnabled: true,
    };
  }
  return response;
}

function mockUseFlagToShowTag(flagName: string) {
  const response = {
    isEnabled: false,
    isClientReady: undefined,
  };
  if (experimentalFlags.find((experimental) => experimental === flagName)) {
    return { ...response, isEnabled: true };
  }
  return response;
}

const mockSection: Section = {
  internalId: 'configure',
  colors: {
    primary: 'blue',
    secondary: 'green',
  },
  items: [
    {
      icon: 'List' as const,
      internalId: 'extpipes',
      title: 'Create and monitor extraction pipelines',
      subtitle:
        'Document and monitor health of extraction pipelines ingesting data across data sets',
      importMapApp: '@cognite/test',
    },
  ],
};

const queryClient = new QueryClient();

const renderWithQueryClient = (children: any) => {
  return render(
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Menu', () => {
  it('Should hide the experimental tag', () => {
    jest
      .spyOn(featureFlags, 'useFlag')
      .mockImplementation(mockUseFlagToHideTag);
    renderWithQueryClient(
      <SectionWrapper flow="COGNITE_AUTH" section={mockSection} />
    );
    const experimental = screen.queryByText('Preview');
    expect(experimental).toBeFalsy();
  });

  it('Should show the experimental tag', () => {
    jest
      .spyOn(featureFlags, 'useFlag')
      .mockImplementation(mockUseFlagToShowTag);
    renderWithQueryClient(
      <SectionWrapper flow="COGNITE_AUTH" section={mockSection} />
    );
    const experimental = screen.queryAllByText('Preview');
    expect(experimental).toBeTruthy();
    expect(experimental.length).toEqual(experimentalFlags.length);
  });
});
