import React from 'react';
import { Body, Detail } from '@cognite/cogs.js';
import { Spin } from 'antd';
import styled from 'styled-components';

export const PreviewProcessingOverlay = () => (
  <OverlayContainer>
    <OverlayTextHeader level={2}>Processing ...</OverlayTextHeader>
    <OverlayTextBody>
      Creating annotations and viewing detected annotations <br />
      is blocked until the file has been processed
    </OverlayTextBody>
    <OverlaySpin />
  </OverlayContainer>
);

const OverlayTextHeader = styled(Body)`
  color: #fafafa !important;
`;
const OverlayTextBody = styled(Detail)`
  color: #fafafa !important;
  text-align: center;
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
  gap: 10px;
  margin-left: 50px;
`;
