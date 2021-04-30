import React, { useEffect, useMemo, useState } from 'react';
import { FileInfo as File } from '@cognite/sdk';
import { Loader, useFileIcon } from '@cognite/data-exploration';

import {
  Body,
  DocumentIcon,
  Button,
  Dropdown,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';
import { Popover } from 'src/modules/Common/Components/Popover';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import exifIcon from 'src/assets/exifIcon.svg';
import { RootState } from 'src/store/rootReducer';
import { makeAnnotationBadgePropsByFileId } from 'src/modules/Process/processSlice';
import { selectUpdatedFileDetails } from 'src/modules/FileMetaData/fileMetadataSlice';
import { TableDataItem } from 'src/modules/Common/Types';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { AnnotationsBadge } from '../AnnotationsBadge/AnnotationsBadge';
import { AnnotationsBadgePopoverContent } from '../AnnotationsBadge/AnnotationsBadgePopoverContent';
import { AnnotationsBadgeProps } from '../../../Workflow/types';
import { isFilePreviewable } from '../FileUploader/utils/FileUtils';

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

  const isPreviewable = isFilePreviewable({ name: item.name } as FileInfo); // TODO: check if file is previewable
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
      <div className="documentIconContainer">
        <DocumentIcon file={item.name} style={{ height: 36, width: 36 }} />
        {isError && <Body level={3}>Unable to preview file.</Body>}
      </div>
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
      <Menu.Item onClick={handleMetadataEdit}>File details</Menu.Item>
      <Menu.Item>Delete</Menu.Item>
    </Menu>
  );

  const selectAnnotationBadgeProps = useMemo(
    makeAnnotationBadgePropsByFileId,
    []
  );
  const annotationsBadgeProps = useSelector((state: RootState) =>
    selectAnnotationBadgeProps(state, item.id)
  );

  const annotations = Object.keys(annotationsBadgeProps) as Array<
    keyof AnnotationsBadgeProps
  >;
  const reviewDisabled = annotations.some((key) =>
    ['Queued', 'Running'].includes(annotationsBadgeProps[key]?.status || '')
  );
  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, String(item.id))
  );
  return (
    <PreviewCell style={style}>
      <div className="preview">
        {image}
        <div className="footer">
          <div className="nameAndExif">
            <div className="name">{item.name}</div>
            {fileDetails?.geoLocation && (
              <Tooltip content="EXIF data added">
                <div className="exif">
                  <img src={exifIcon} alt="exifIcon" />
                </div>
              </Tooltip>
            )}
          </div>

          <div className="action">
            <Dropdown content={MenuContent}>
              <Button type="ghost" icon="MoreOverflowEllipsisHorizontal" />
            </Dropdown>
          </div>
          <div className="badge">
            <Popover
              placement="bottom"
              trigger="mouseenter click"
              content={AnnotationsBadgePopoverContent(annotationsBadgeProps)}
            >
              <>{AnnotationsBadge(annotationsBadgeProps)}</>
            </Popover>
          </div>
          <div className="review">
            <Button
              type="secondary"
              icon="ArrowRight"
              iconPlacement="right"
              onClick={handleReview}
              size="small"
              disabled={reviewDisabled}
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
  padding-left: 20px;
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
      grid-template-columns: 4fr 1fr 1fr;
      grid-template-rows: auto;
      grid-template-areas:
        'name name name name . action'
        'badge badge badge . . review';
      .nameAndExif {
        display: flex;
        height: inherit;
        width: inherit;
        white-space: nowrap;
      }
      .name {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        grid-area: name;
        white-space: nowrap;
        max-width: 150px;
      }
      .exif > img {
        padding-bottom: 15px;
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

  .documentIconContainer {
    width: 100%;
    height: 100%;
    align-items: center;
    display: inline-flex;
    justify-content: center;
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
