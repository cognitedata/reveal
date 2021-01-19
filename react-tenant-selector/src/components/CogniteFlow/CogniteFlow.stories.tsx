import React from 'react';
import { action } from '@storybook/addon-actions';

import { StyledContentWrapper } from '../CardContainer/elements';
import { CardFooterError } from '../../components';
import CogniteFlow from './CogniteFlow';

export default {
  title: 'Authentication/CogniteFlow',
};

const cogniteFlowProps = {
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
      <CogniteFlow {...cogniteFlowProps} />
    </StyledContentWrapper>
  );
};

export const WithInitialTenant = () => {
  return (
    <StyledContentWrapper>
      <CogniteFlow {...cogniteFlowProps} tenant="initial-tenant" />
    </StyledContentWrapper>
  );
};

export const Loading = () => {
  return (
    <StyledContentWrapper>
      <CogniteFlow {...cogniteFlowProps} tenant="initial-tenant" loading />
    </StyledContentWrapper>
  );
};

export const WithError = () => {
  return (
    <StyledContentWrapper>
      <CogniteFlow
        {...cogniteFlowProps}
        errorList={
          <CardFooterError style={{ marginTop: '16px' }}>
            This is just a storybook
          </CardFooterError>
        }
      />
    </StyledContentWrapper>
  );
};
