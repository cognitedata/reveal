import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import { useFlag } from '@cognite/react-feature-flags';

import { ReactComponent as CopilotIcon } from '../../assets/CopilotIcon.svg';
import zIndex from '../utils/zIndex';
export const COPILOT_TOGGLE = 'COPILOT_TOGGLE';

export const CopilotButton = (): JSX.Element => {
  const [isCopilotVisible, setCopilotVisible] = useState<boolean>(false);
  const [hasImportMap, setHasImportMap] = useState<boolean>(false);

  useEffect(() => {
    const listener = (ev: Event) => {
      if ('detail' in ev) {
        const toggleEvent = ev as CustomEvent<{ active?: boolean }>;
        if ('active' in toggleEvent.detail) {
          setCopilotVisible(toggleEvent.detail.active || false);
        }
      }
    };
    window.addEventListener(COPILOT_TOGGLE, listener);
    return () => {
      window.removeEventListener(COPILOT_TOGGLE, listener);
    };
  }, [isCopilotVisible]);

  useEffect(() => {
    setHasImportMap(!!document.querySelector('import-map-overrides-full'));
  }, []);

  const { isEnabled } = useFlag('COGNITE_COPILOT', {
    fallback: false,
    forceRerender: true,
  });

  if (!isEnabled) {
    return <></>;
  }

  return (
    <ButtonWrapper
      style={{ right: hasImportMap ? 70 : 10 }}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent(COPILOT_TOGGLE, {
            detail: { active: !isCopilotVisible },
          })
        );
      }}
    >
      <CopilotIcon style={{ height: 24, width: 24 }} />
    </ButtonWrapper>
  );
};

const ButtonWrapper = styled.div`
  z-index: ${zIndex.MAXIMUM};
  position: fixed;
  bottom: 10px;
  width: 50px;
  height: 50px;
  background: #ffffff;

  box-shadow: 0px 1px 16px 4px rgba(79, 82, 104, 0.1),
    0px 1px 8px rgba(79, 82, 104, 0.08), 0px 1px 2px rgba(79, 82, 104, 0.24);
  border-radius: 8px;

  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;
