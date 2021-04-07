import React, { useEffect, useMemo, useState } from 'react';
import { FileInfo as File } from '@cognite/sdk';
import { Loader, useFileIcon } from '@cognite/data-exploration';

import { Body, DocumentIcon, Button, Dropdown, Menu } from '@cognite/cogs.js';
import { Popover } from 'src/components/Common/Popover';
import styled from 'styled-components';
import { AnnotationsBadge } from '../AnnotationsBadge/AnnotationsBadge';
import { TableDataItem } from '../FileTable/FileTable';
import { AnnotationsBadgePopoverContent } from '../AnnotationsBadge/AnnotationsBadgePopoverContent';

export const FileGridPreview = ({
  item,
  style,
}: {
  item: TableDataItem;
  style?: React.CSSProperties;
}) => {
  const [imageUrl, setImage] = useState<string | undefined>(undefined);
  const { data, isError } = useFileIcon({
    id: item.id,
    uploaded: true,
    mimeType: item.mimeType,
  } as File);

  const isPreviewable = true; // TODO: check if file is previewable
  useEffect(() => {
    if (data) {
      const arrayBufferView = new Uint8Array(data);
      const blob = new Blob([arrayBufferView]);
      setImage(URL.createObjectURL(blob));
    }
    return () => {
      setImage((url) => {
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

  const handleReview = () => {
    if (item.menu?.onReviewClick) {
      item.menu.onReviewClick(item.id);
    }
  };

  const handleMetadataEdit = () => {
    if (item.menu?.showMetadataPreview) {
      item.menu.showMetadataPreview(item.id);
    }
  };

  const MenuContent = (
    <Menu
      style={{
        color: 'black' /* typpy styles make color to be white here ... */,
      }}
    >
      <Menu.Item onClick={handleMetadataEdit}>Edit metadata</Menu.Item>
      <Menu.Item>Delete</Menu.Item>
    </Menu>
  );

  return (
    <PreviewCell style={style}>
      <div className="preview">
        {image}
        <div className="footer">
          <div className="name">{item.name}</div>
          <div className="action">
            <Dropdown content={MenuContent}>
              <Button type="ghost" icon="MoreOverflowEllipsisHorizontal" />
            </Dropdown>
          </div>
          <div className="badge">
            {item.annotationsBadgeProps && (
              <Popover
                placement="bottom"
                trigger="click"
                content={AnnotationsBadgePopoverContent(
                  item.annotationsBadgeProps
                )}
              >
                <>{AnnotationsBadge(item.annotationsBadgeProps)}</>
              </Popover>
            )}
          </div>
          <div className="review">
            <Button
              type="secondary"
              icon="ArrowRight"
              iconPlacement="right"
              onClick={handleReview}
              size="small"
            >
              Review
            </Button>
          </div>
        </div>
      </div>
    </PreviewCell>
  );
};

const PreviewCell = styled.div`
  margin-top: 30px;
  .preview {
    height: 90%;
    width: 90%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-shadow: 0px 2px 12px rgba(0, 0, 0, 0.08);
    border-radius: 5px;

    .footer {
      border-radius: inherit;
      width: 100%;
      display: grid;
      padding: 12px;
      row-gap: 19px;
      grid-template-columns: 3fr 1fr 1fr;
      grid-template-rows: auto;
      grid-template-areas:
        'name name name . action'
        'badge badge badge . review';
      .name {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        grid-area: name;
      }
      .action {
        grid-area: action;
        justify-self: end;
      }
      .badge {
        grid-area: badge;
      }
      .review {
        grid-area: review;
      }
    }
    :hover {
      box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.15);
    }
  }

  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
    background: #fff;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    overflow: auto;
  }
  .cogs-body-1 {
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
  }
  .selection {
    position: absolute;
    top: 12px;
    left: 12px;
    .cogs-checkbox {
      .checkbox-ui {
        border: 2px solid #fff;
      }
    }
  }
`;
