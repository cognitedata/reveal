import React from 'react';
import styled from 'styled-components';
import { Spin } from 'antd';

const LoadingWrapper = styled.div`
  height: calc(100vh - 128px);
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function Spinner() {
  return (
    <LoadingWrapper>
      <Spin size="large" />
    </LoadingWrapper>
  );
}
