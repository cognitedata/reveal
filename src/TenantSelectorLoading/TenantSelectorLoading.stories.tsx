import React from 'react';

import TenantSelectorLoading from './TenantSelectorLoading';

export default {
  title: 'Authentication|TenantSelectorLoading',
};

export const Base = () => {
  return <TenantSelectorLoading />;
};

export const WithError = () => {
  return <TenantSelectorLoading errorId="123" />;
};
