import React from 'react';

import styled from 'styled-components';

import {
  annotationTypeIconMap,
  annotationTypeStyleMap,
} from '@vision/constants/annotationDetailPanel';
import {
  ExpandIconComponent,
  KeyboardShortCutSelectable,
} from '@vision/modules/Review/Containers/AnnotationDetailPanel/components/common';
import {
  AnnotationDetailPanelAnnotationType,
  AnnotationDetailPanelRowDataBase,
  VirtualizedTreeRowProps,
} from '@vision/modules/Review/Containers/AnnotationDetailPanel/types';

import { Icon, IconType } from '@cognite/cogs.js';

/**
 * Annotation detail row component for main annotation category group headers
 * @param name
 * @param isOpen
 * @param childItems
 * @param additionalData
 * @constructor
 */
export const ReviewVisionAnnotationTypeRow = ({
  name,
  isOpen,
  childItems,
  additionalData,
}: VirtualizedTreeRowProps<
  AnnotationDetailPanelRowDataBase<AnnotationDetailPanelAnnotationType>
>) => {
  const {
    common: { annotationType },
    callbacks: { onSelect },
    title,
    selected,
  } = additionalData;
  return (
    <KeyboardShortCutSelectable id={title} selected={selected}>
      <PanelHeader onClick={() => onSelect(title, !selected)}>
        <ExpandIconComponent isActive={isOpen} />
        <IconContainer
          background={annotationTypeStyleMap[annotationType].backgroundColor}
          style={{
            color: annotationTypeStyleMap[annotationType].color,
            flex: '0 0 16px',
          }}
        >
          <Icon type={annotationTypeIconMap[annotationType] as IconType} />
        </IconContainer>
        <span>
          {name} ({childItems.length})
        </span>
      </PanelHeader>
    </KeyboardShortCutSelectable>
  );
};

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 12px;
  line-height: 16px;
  height: 40px;

  &:hover {
    background-color: var(--cogs-greyscale-grey2);
  }
`;

interface IconContainerProps {
  background: string;
}

const IconContainer = styled.div<IconContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 22px;
  border-radius: 4px;
  margin-right: 8px;
  background-color: ${(props) =>
    props.background ? props.background : '#fcf5fd'};
`;
