import React from 'react';
import { action } from '@storybook/addon-actions';

import CardContainer from './CardContainer';

export default {
  title: 'Authentication/CardContainer',
};

const cardContainerProps = {
  applicationId: 'test-id',
  applicationName: 'test-name',
  cdfCluster: 'test-cdfCluster',
  directory: 'test-directory',
  handleSubmit: action('handleSubmit'),
  handleClusterSubmit: action('handleClusterSubmit'),
  validateTenant: () => Promise.resolve(true),
  validateCluster: () => Promise.resolve(true),
  loading: false,
  initialTenant: '',
  enabledLoginModes: {
    cognite: true,
    aad: true,
    adfs: true,
  },
};

export const Base = () => {
  return <CardContainer {...cardContainerProps} />;
};

export const WithoutLegacy = () => {
  return (
    <CardContainer {...cardContainerProps} enabledLoginModes={{ aad: true }} />
  );
};

export const WithoutLegacyWithErrors = () => {
  return (
    <CardContainer
      {...cardContainerProps}
      enabledLoginModes={{ aad: true }}
      authState={{
        authenticated: false,
        initialising: false,
        error: true,
        errorMessage:
          'This is a really long error message with technical details that spans many lines. That is why we want to hide it.',
      }}
    />
  );
};

export const WithInitialTenant = () => {
  return (
    <CardContainer {...cardContainerProps} initialTenant="initial-tenant" />
  );
};

export const WithInitialCluster = () => {
  return (
    <CardContainer
      {...cardContainerProps}
      initialTenant="initial-tenant"
      initialCluster="initial-cluster"
    />
  );
};

export const Loading = () => {
  return (
    <CardContainer
      {...cardContainerProps}
      initialTenant="initial-tenant"
      loading
    />
  );
};

export const WithError = () => {
  return (
    <CardContainer {...cardContainerProps} errors={['This is a login error']} />
  );
};
