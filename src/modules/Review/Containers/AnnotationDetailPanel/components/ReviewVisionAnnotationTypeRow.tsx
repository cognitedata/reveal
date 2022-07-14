import React from 'react';
import styled from 'styled-components';
import { AllIconTypes, Icon } from '@cognite/cogs.js';
import {
  AnnotationDetailPanelAnnotationType,
  AnnotationDetailPanelRowDataBase,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import {
  ExpandIconComponent,
  KeyboardShortCutSelectable,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components/common';
import {
  ModelTypeIconMap,
  ModelTypeStyleMap,
} from 'src/api/annotation/legacy/legacyAnnotationUtils';

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
    common: { mode },
    callbacks: { onSelect },
    title,
    selected,
  } = additionalData;
  return (
    <KeyboardShortCutSelectable id={title} selected={selected}>
      <PanelHeader onClick={() => onSelect(title, !selected)}>
        <ExpandIconComponent isActive={isOpen} />
        <IconContainer background={ModelTypeStyleMap[mode].backgroundColor}>
          <Icon
            style={{
              color: ModelTypeStyleMap[mode].color,
              flex: '0 0 16px',
            }}
            type={ModelTypeIconMap[mode] as AllIconTypes}
          />
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
  height: 30px;

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
