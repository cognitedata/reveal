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

export const WithInitialTenant = () => {
  return (
    <CardContainer {...cardContainerProps} initialTenant="initial-tenant" />
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
    <CardContainer
      {...cardContainerProps}
      errors={['This is just a storybook']}
    />
  );
};
