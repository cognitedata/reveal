import React, { useMemo } from 'react';
import Highlighter from 'react-highlight-words';

import styled, { css } from 'styled-components';

import { TimeDisplay } from '@data-exploration/components';
import { FileThumbnail } from '@data-exploration/containers';
import { useSelectionCheckbox } from '@data-exploration-components/hooks/useSelection';
import { SelectableItemsProps } from '@data-exploration-components/types';

import { Body, Colors } from '@cognite/cogs.js';
import { FileInfo as File } from '@cognite/sdk';

export const FileGridPreview = ({
  item,
  query,
  style,
  onClick,
  isActive = false,
  isPreviewing = false,
  selectionMode,
  onSelect,
  isSelected,
}: {
  item: File;
  query: string;
  isActive?: boolean;
  isPreviewing?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
} & SelectableItemsProps) => {
  const isCellSelected = useMemo(
    () => isSelected({ type: 'file', id: item.id }),
    [isSelected, item.id]
  );

  return (
    <PreviewCell
      onClick={onClick}
      style={style}
      isActive={isActive}
      isPreviewing={isPreviewing}
    >
      <div className="preview">
        <FileThumbnail file={item} />
      </div>
      <Body>
        <Highlighter
          searchWords={query.split(' ')}
          textToHighlight={item.name}
          autoEscape
        />
      </Body>
      <Body level={3}>
        <span>
          Created at: <TimeDisplay value={item.createdTime} relative />
        </span>
      </Body>
      <div className="selection">
        {useSelectionCheckbox(selectionMode, item.id, isCellSelected, () =>
          onSelect({ type: 'file', id: item.id })
        )}
      </div>
    </PreviewCell>
  );
};

const PreviewCell = styled.div<{ isActive: boolean; isPreviewing: boolean }>(
  (props) => css`
    height: 400px;
    padding: 12px;
    cursor: pointer;
    position: relative;
    .preview {
      height: 300px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
    }
    img {
      height: 100%;
      width: 100%;
      object-fit: contain;
      background: #fff;
    }
    .cogs-body-1 {
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
      white-space: nowrap;
    }
    .selection {
      position: absolute;
      top: 24px;
      right: 24px;
    }
    ${!props.isPreviewing &&
    css`
      &&:hover {
        background: ${Colors['decorative--grayscale--100']};
      }
    `}

    ${props.isPreviewing &&
    css`
      background: ${Colors['decorative--blue--700']};
    `}

    ${props.isActive &&
    css`
      background: ${Colors['decorative--grayscale--100']};
    `}
  `
);
