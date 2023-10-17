import React, { useEffect, useState } from 'react';

import styled, { css } from 'styled-components';

import { Body, Flex, Icon } from '@cognite/cogs.js';

import { CopilotIcon } from '../../assets/CopilotIcon';
import { useCopilotContext } from '../hooks/useCopilotContext';
import zIndex from '../utils/zIndex';

export const CopilotButton = (): JSX.Element => {
  const { isOpen, setIsOpen } = useCopilotContext();
  const [hasImportMap, setHasImportMap] = useState<boolean>(false);

  useEffect(() => {
    setHasImportMap(
      !!document.querySelector('import-map-overrides-full > div')
    );
  }, []);

  return (
    <ButtonWrapper
      justifyContent="start"
      alignItems="center"
      $visible={isOpen}
      style={{ right: hasImportMap ? 70 : 10 }}
      onClick={() => {
        setIsOpen(!isOpen);
      }}
    >
      {isOpen ? (
        <Icon type="Close" size={24} />
      ) : (
        <div className="cogs-icon cogpilot-icon">
          <CopilotIcon />
        </div>
      )}
      {!isOpen && (
        <Body className="hover-text" strong>
          CogPilot
        </Body>
      )}
    </ButtonWrapper>
  );
};

const ButtonWrapper = styled(Flex)<{ $visible: boolean }>`
  z-index: ${zIndex.BUTTON};
  position: fixed;
  bottom: 10px;
  max-width: 50px;
  min-width: 50px;
  height: 50px;
  overflow: hidden;
  transition: all 0.4s;
  cursor: pointer;
  @media (max-width: 768px) {
    max-width: 36px;
    min-width: 36px;
    height: 36px;
  }

  .cogs-icon {
    color: white;
    height: 24px;
    width: 24px;
    min-width: 24px;
    margin-left: 13px;
    margin-right: 13px;
  }
  @media (max-width: 768px) {
    .cogs-icon {
      margin-left: 6px;
      margin-right: 6px;
    }
  }

  &&:before {
    content: '';
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 20px 10px 4px 20px;
    border: 2px solid rgba(22, 30, 80, 0.16);
    ${(props) =>
      props.$visible &&
      css`
        border-radius: 50%;
      `};
    transition: all 0.4s;
  }

  border-radius: 20px 10px 4px 20px;
  background: radial-gradient(
    174.05% 174.05% at 100% 95.83%,
    #8e5cff 0%,
    #2e1065 100%
  );

  .hover-text {
    overflow: hidden;
    color: white;
    white-space: nowrap;
    flex: 1;
    transition-delay: 0.2s;
    margin-right: 13px;
  }
  .cogpilot-icon {
    margin-right: 6px;
    svg {
      fill: white;
    }
  }

  &&:hover {
    max-width: 400px;
    transition: all 0.4s, max-width 0.4s linear 1s;
  }
  ${(props) =>
    props.$visible &&
    css`
      background: radial-gradient(
        174.05% 174.05% at 100% 95.83%,
        #2e1065 100%,
        #2e1065 100%
      );
      border-radius: 50%;
    `};

  box-shadow: 0px 1px 16px 4px rgba(79, 82, 104, 0.1),
    0px 1px 8px rgba(79, 82, 104, 0.08), 0px 1px 2px rgba(79, 82, 104, 0.24);
`;
