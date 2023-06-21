import React from 'react';
import { Detail } from '@cognite/cogs.js';
import { Spin } from 'antd';
import styled from 'styled-components';

export const ThumbnailProcessingOverlay = () => (
  <OverlayContainer>
    <OverlayText>Processing ...</OverlayText>
    <OverlaySpin />
  </OverlayContainer>
);

const OverlayText = styled(Detail)`
  color: #fafafa !important;
`;
const OverlaySpin = styled(Spin)`
  color: #fafafa !important;
`;

const OverlayContainer = styled.div`
  display: flex;
  flex-flow: column;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0.8;
  transition: 0.5s ease;
  background: #262626;
`;
