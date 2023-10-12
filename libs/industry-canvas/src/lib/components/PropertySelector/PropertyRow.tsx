import React from 'react';
import { Draggable } from 'react-beautiful-dnd';

import styled from 'styled-components';

import { startCase } from 'lodash';

import { Checkbox, Icon, Colors, Body, Tooltip } from '@cognite/cogs.js';

import { Property } from './types';
import { getLastPartOfPropertyPath } from './utils';

type PropertyRowProps = {
  property: Property;
  index: number;
  onSelect: () => void;
};

const PropertyRow = ({ property, index, onSelect }: PropertyRowProps) => {
  const label = startCase(getLastPartOfPropertyPath(property.path));
  return (
    <Draggable draggableId={property.path} index={index}>
      {(provided) => (
        <PropertyRowContainer
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <ControlsContainer>
            <FixedWidthContentContainer>
              <Icon
                {...provided.dragHandleProps}
                type="DragHandleVertical"
                style={{ cursor: 'grab' }}
              />
            </FixedWidthContentContainer>

            <FixedWidthContentContainer>
              <Checkbox
                name={property.path}
                checked={property.isSelected}
                onChange={onSelect}
              />
            </FixedWidthContentContainer>
          </ControlsContainer>

          <ContentContainer>
            {/* attaching the tooltip to document.body to not break the width of parent container */}
            <ColumnContentContainer>
              <Tooltip content={label} appendTo={document.body}>
                <Body
                  size="medium"
                  color={Colors['text-icon--medium']}
                  title={label}
                >
                  {label}
                </Body>
              </Tooltip>
            </ColumnContentContainer>
            {/* attaching the tooltip to document.body to not break the width of parent container */}
            <ColumnContentContainer>
              <Tooltip
                content={String(property.value)}
                appendTo={document.body}
              >
                <Body size="medium">{String(property.value)}</Body>
              </Tooltip>
            </ColumnContentContainer>
          </ContentContainer>
        </PropertyRowContainer>
      )}
    </Draggable>
  );
};

export default PropertyRow;

const FixedWidthContentContainer = styled.div`
  display: flex;
  flex-grow: 0;
  width: 20px;
  height: 20px;
  align-items: center;
`;

const ControlsContainer = styled.div`
  display: flex;
  flex-grow: 0;
  flex-direction: row;
  align-items: center;

  & > *:first-child {
    margin-right: 8px;
    margin-left: 8px;
    width: 50%;
  }
`;

const ColumnContentContainer = styled.div`
  display: flex;
  width: 50%;
  display: flex;

  &:first-child {
    margin-right: 8px;
  }

  &:last-child {
    justify-content: flex-end;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  align-items: center;
  width: 100%;
  overflow: hidden;

  * {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

const PropertyRowContainer = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: row;
  align-items: center;
  background-color: white;
  height: 36px;

  & > * {
    margin-right: 8px;
  }
`;
