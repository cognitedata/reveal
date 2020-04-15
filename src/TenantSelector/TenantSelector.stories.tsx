import React, { useState } from 'react';

import { action } from '@storybook/addon-actions';
import TenantSelector from './TenantSelector';

export default {
  title: 'Authentication|TenantSelector',
};

type TenantSelectorProps = {
  initiallyLoading?: boolean;
};

const useTenantSelector = ({
  initiallyLoading = false,
}: TenantSelectorProps = {}) => {
  const [loading, setLoading] = useState(initiallyLoading);

  const validateTenant = (tenant: string) => {
    setLoading(true);
    return new Promise<boolean>((resolve) =>
      setTimeout(() => {
        setLoading(false);
        resolve(tenant === 'valid-tenant');
      }, 300)
    );
  };

  return { validateTenant, handleSubmit: action('handleSubmit'), loading };
};

export const Base = () => {
  const tenantSelectorProps = useTenantSelector();
  return <TenantSelector {...tenantSelectorProps} />;
};

export const WithInitialTenant = () => {
  const tenantSelectorProps = useTenantSelector();
  return (
    <TenantSelector {...tenantSelectorProps} initialTenant="initial-tenant" />
  );
};

export const Loading = () => {
  const tenantSelectorProps = useTenantSelector({ initiallyLoading: true });
  return (
    <TenantSelector {...tenantSelectorProps} initialTenant="initial-tenant" />
  );
};

export const WithError = () => {
  const tenantSelectorProps = useTenantSelector();

  return (
    <TenantSelector
      {...tenantSelectorProps}
      error={
        <>
          <div>
            Something is taking longer than usual. Please refresh the page.
          </div>
          <div>
            Contact <a href="mailto:support@cognite.com">support@cognite.com</a>{' '}
            if the problem persists.
          </div>
        </>
      }
    />
  );
};
