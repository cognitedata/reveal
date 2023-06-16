import React, { MutableRefObject, ReactElement, useRef } from 'react';

import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

import SidePanelItemHeader from './SidePanelItemHeader';

export type SidePanelItemProps<T extends string> = {
  children: ReactElement;
  className?: string;
  extraContent?: {
    left?: (panelProps: SidePanelItemInternalProps<T>) => React.ReactNode;
    right?: (panelProps: SidePanelItemInternalProps<T>) => React.ReactNode;
  };
  footer?:
    | ((panelProps: SidePanelItemInternalProps<T>) => React.ReactNode)
    | boolean;
  key: string;
  title:
    | string
    | ((panelProps: SidePanelItemInternalProps<T>) => React.ReactNode);
} & SidePanelItemInternalProps<T>;

export type SidePanelItemInternalProps<T extends string> = {
  activePanelKey: T;
  onChange: (key: T) => void;
  onClose: () => void;
};

export type SidePanelItemContentInternalProps<T extends string> = {
  contentRef?: MutableRefObject<HTMLDivElement | null>;
} & SidePanelItemInternalProps<T>;

const SidePanelItem = <T extends string>(
  props: SidePanelItemProps<T>
): JSX.Element => {
  const {
    activePanelKey,
    children,
    className,
    extraContent,
    onChange,
    onClose,
    title,
  } = props;

  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <StyledSidePanelItemContainer>
      <SidePanelItemHeader<T>
        activePanelKey={activePanelKey}
        extraContent={extraContent}
        onChange={onChange!}
        onClose={onClose!}
        title={title}
      />
      <StyledContent className={className} ref={contentRef}>
        {React.cloneElement(children, {
          ...children.props,
          activePanelKey,
          contentRef,
          onChange,
          onClose,
        })}
      </StyledContent>
    </StyledSidePanelItemContainer>
  );
};

const StyledSidePanelItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled.div`
  padding: 12px;
  border-color: ${Colors['border--status-undefined--muted']};
  border-style: solid;
  border-width: 1px 0;
  flex-grow: 1;
  overflow-y: auto;
  width: 100%;
  /* NOTE Height is needed for scroll */
  height: 0;
`;

export default SidePanelItem;
