import React from 'react';

import styled from 'styled-components';

import { Colors, Flex } from '@cognite/cogs.js';

const ResourceLoadingSkeleton = () => {
  return (
    <StyledSkl>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ padding: 12 }}
      >
        <Flex justifyContent="flex-start">
          <div className="skl skl-title-heading" />
          <div className="skl skl-title-sub-heading" />
        </Flex>
        <div className="skl skl-browse" />
      </Flex>
      <Flex style={{ padding: 12 }}>
        <div className="skl skl-icon" />
        <Flex direction="column" justifyContent="flex-start">
          <div className="skl skl-resource-name" />
          <div className="skl skl-resource-desc" />
        </Flex>
      </Flex>
    </StyledSkl>
  );
};

const StyledSkl = styled.div`
  .skl {
    background: ${Colors['surface--strong']};
    border-radius: 4px;
    animation: skeleton-loading 1s linear infinite alternate;
  }

  @keyframes skeleton-loading {
    0% {
      background-color: hsl(0, 0%, 90%);
    }
    100% {
      background-color: hsl(0, 0%, 96%);
    }
  }

  .skl-title-heading {
    height: 18px;
    width: 82px;
  }
  .skl-title-sub-heading {
    height: 18px;
    width: 18px;
    margin-left: 8px;
  }
  .skl-browse {
    height: 18px;
    width: 148px;
  }
  .skl-icon {
    height: 24px;
    width: 24px;
    margin: 4px 12px 4px;
  }
  .skl-resource-name {
    height: 16px;
    width: 200px;
  }
  .skl-resource-desc {
    height: 10px;
    width: 230px;
    margin-top: 4px;
  }
`;

export default ResourceLoadingSkeleton;
