import React from 'react';
import { action } from '@storybook/addon-actions';
import { StyledContentWrapper } from '../CardContainer/elements';
import ClusterSelector from './ClusterSelector';

export default {
  title: 'Authentication|ClusterSelector',
};

const clusterSelectorProps = {
  formState: {
    tenant: {
      value: '',
      isValid: false,
      error: '',
    },
    cluster: {
      value: '',
      isValid: true,
      error: '',
    },
  },
  handleOnChange: action('handleOnChange'),
  backToTenantSelector: action('backToTenantSelector'),
  loading: false,
  onSubmit: action('onSubmit'),
};

export const Base = () => {
  return (
    <StyledContentWrapper>
      <ClusterSelector {...clusterSelectorProps} />
    </StyledContentWrapper>
  );
};
