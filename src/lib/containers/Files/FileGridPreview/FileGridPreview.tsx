import React, { useEffect, useMemo, useState } from 'react';
import { FileInfo as File } from '@cognite/sdk';
import { useSelectionCheckbox } from 'lib/hooks/useSelection';
import styled, { css } from 'styled-components';
import { Loader, TimeDisplay } from 'lib/components';
import { Body, Colors, DocumentIcon } from '@cognite/cogs.js';
import Highlighter from 'react-highlight-words';
import { useFileIcon } from 'lib/hooks/sdk';
import { isFileOfType } from 'lib/utils/FileUtils';
import { SelectableItemsProps } from 'lib/CommonProps';

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
  const [imageUrl, setImage] = useState<string | undefined>(undefined);
  const { data, isError } = useFileIcon(item);
  const isPreviewable = isFileOfType(item, [
    'png',
    'jpg',
    'jpeg',
    'tiff',
    'gif',
  ]);
  useEffect(() => {
    if (data) {
      const arrayBufferView = new Uint8Array(data);
      const blob = new Blob([arrayBufferView]);
      setImage(URL.createObjectURL(blob));
    }
    return () => {
      setImage(url => {
        if (url) {
          URL.revokeObjectURL(url);
        }
        return undefined;
      });
    };
  }, [data]);

  const image = useMemo(() => {
    if (isPreviewable) {
      if (imageUrl) {
        return <img src={imageUrl} alt="" />;
      }
      if (!isError) {
        return <Loader />;
      }
    }
    return (
      <>
        <DocumentIcon file={item.name} style={{ height: 36, width: 36 }} />
        {isError && <Body level={3}>Unable to preview file.</Body>}
      </>
    );
  }, [imageUrl, isPreviewable, item, isError]);

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
      <div className="preview">{image}</div>
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
  props => css`
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
        background: ${Colors['greyscale-grey1'].hex()};
      }
    `}

    ${props.isPreviewing &&
    css`
      background: ${Colors['midblue-7'].hex()};
    `}

    ${props.isActive &&
    css`
      background: ${Colors['greyscale-grey1'].hex()};
    `}
  `
);
