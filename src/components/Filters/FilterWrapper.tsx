import React from 'react';
import styled from 'styled-components';
import { Tooltip } from '@cognite/cogs.js';
import { Spin } from 'antd';
import Layers from 'utils/zindex';

type Props = {
  children?: React.ReactNode;
  tooltipContent?: string;
  hasPermission?: boolean;
  isLoaded?: boolean;
};

export const FilterWrapper = (props: Props) => {
  const {
    children,
    tooltipContent,
    hasPermission = true,
    isLoaded = true,
  } = props;
  return (
    <Tooltip interactive disabled={hasPermission} content={tooltipContent}>
      <Wrapper hasPermission={hasPermission}>
        <Spin spinning={!isLoaded} size="small">
          {children}
        </Spin>
      </Wrapper>
    </Tooltip>
  );
};

const Wrapper = styled.div`
  max-width: 200px;
  min-width: 200px;
  z-index: ${Layers.POPOVER};
  cursor: ${({ hasPermission }: { hasPermission: boolean }) =>
    !hasPermission ? 'not-allowed' : 'pointer'};
`;
