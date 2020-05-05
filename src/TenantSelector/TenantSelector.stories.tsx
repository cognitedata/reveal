import React from 'react';
import { action } from '@storybook/addon-actions';

import { StyledContentWrapper } from '../CardContainer/elements';
import CardFooterError from '../CardFooterError/CardFooterError';
import TenantSelector from './TenantSelector';

export default {
  title: 'Authentication|TenantSelector',
};

const tenantSelectorProps = {
  tenant: '',
  loading: false,
  errorList: null,
  tenantError: '',
  onSubmit: action('onSubmit'),
  handleOnChange: action('handleOnChange'),
  setClusterSelectorShown: action('setClusterSelectorShown'),
};

export const Base = () => {
  return (
    <StyledContentWrapper>
      <TenantSelector {...tenantSelectorProps} />
    </StyledContentWrapper>
  );
};

export const WithInitialTenant = () => {
  return (
    <StyledContentWrapper>
      <TenantSelector {...tenantSelectorProps} tenant="initial-tenant" />
    </StyledContentWrapper>
  );
};

export const Loading = () => {
  return (
    <StyledContentWrapper>
      <TenantSelector
        {...tenantSelectorProps}
        tenant="initial-tenant"
        loading
      />
    </StyledContentWrapper>
  );
};

export const WithError = () => {
  return (
    <StyledContentWrapper>
      <TenantSelector
        {...tenantSelectorProps}
        errorList={
          <CardFooterError style={{ marginTop: '16px' }}>
            This is just a storybook
          </CardFooterError>
        }
      />
    </StyledContentWrapper>
  );
};
