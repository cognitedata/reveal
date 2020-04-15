import React from 'react';

import { action } from '@storybook/addon-actions';
import TenantSelectorScreen from './TenantSelectorScreen';

export default {
  title: 'Authentication|TenantSelectorScreen',
};

export const Base = () => {
  return (
    <TenantSelectorScreen
      handleSubmit={action('handleSubmit')}
      validateTenant={() => Promise.resolve(true)}
      loading={false}
    />
  );
};
