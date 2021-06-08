import React from 'react';
import styled from 'styled-components';

import background from '../../assets/background.jpg';

import TenantSelectorBackground from './TenantSelectorBackground';

const Content = styled.div`
  background-color: white;
  padding: 40px;
`;

export default {
  title: 'Layout/TenantSelectorBackground',
};

const props = {
  backgroundImage: background,
};

export const Base = () => {
  return (
    <TenantSelectorBackground {...props}>
      <Content>Content goes here</Content>
    </TenantSelectorBackground>
  );
};
