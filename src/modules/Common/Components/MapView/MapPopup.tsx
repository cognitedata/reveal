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
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import exifIcon from 'src/assets/exifIcon.svg';
import { RootState } from 'src/store/rootReducer';
import { selectUpdatedFileDetails } from 'src/modules/FileMetaData/fileMetadataSlice';
import { makeAnnotationBadgePropsByFileId } from 'src/modules/Process/processSlice';
import { AnnotationsBadgeProps } from 'src/modules/Workflow/types';
import { TableDataItem } from 'src/modules/Common/Types';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { AnnotationsBadge } from '../AnnotationsBadge/AnnotationsBadge';
import { AnnotationsBadgePopoverContent } from '../AnnotationsBadge/AnnotationsBadgePopoverContent';
import { Popover } from '../Popover';
import { isFilePreviewable } from '../FileUploader/utils/FileUtils';

export const MapPopup = ({
  item,
  style,
}: {
  item: TableDataItem | undefined;
  style?: React.CSSProperties;
}) => {
  if (!item) {
    return <div />;
  }

  // TODO: from FileGridPreview -> refactor
  const [imageUrl, setImage] = useState<string | undefined>(undefined);
  const { data, isError } = useFileIcon({
    id: item.id,
    uploaded: true,
    mimeType: item.mimeType,
  } as File);

  const isPreviewable = isFilePreviewable({ name: item.name } as FileInfo);
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
    <MapPopupContainer style={style}>
      <div className="preview">
        <div className="image">{image}</div>
        <div className="fileDetails">
          <table>
            <tbody>
              <tr>
                <td>Filename</td>
                <th>
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
                </th>
              </tr>
              <tr>
                <td>Mime type</td>
                <th>{item.mimeType}</th>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="action">
          <Dropdown content={MenuContent}>
            <Button
              type="ghost"
              icon="MoreOverflowEllipsisHorizontal"
              aria-label="action button"
            />
          </Dropdown>
        </div>
      </div>
      <div className="footer">
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
            aria-label="review button"
          >
            Review
          </Button>
        </div>
      </div>
    </MapPopupContainer>
  );
};

const MapPopupContainer = styled.div`
  display: grid;
  background: white;
  border-radius: 5px;
  border: 1px solid #c4c4c4;
  overflow: hidden;
  max-width: 500px;
  grid-template-rows: 86px 50px;
  grid-template-areas:
    'preview'
    'footer';

  .preview {
    grid-area: preview;
    display: grid;
    padding-left: 12px;
    grid-template-columns: 100px 150px 70px;
    grid-template-areas: 'image fileDetails action';

    .image {
      grid-area: image;
      padding-top: 11px;
      overflow: hidden;

      img {
        object-fit: cover;
        max-width: 100%;
      }
    }

    .fileDetails {
      grid-area: fileDetails;
      padding-left: 14px;
      padding-top: 11px;

      table {
        table-layout: fixed;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: smaller;
      }

      .nameAndExif {
        display: flex;
        align-items: center;
      }
      .name {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        white-space: nowrap;
        max-width: 150px;
      }
      .exif > img {
        width: 11px;
        padding-bottom: 15px;
      }
    }

    .action {
      grid-area: action;
      justify-self: end;
      padding-right: 12px;
    }
  }

  .footer {
    grid-area: footer;
    border-radius: inherit;
    align-items: center;
    width: 100%;
    display: grid;
    padding: 12px;
    row-gap: 19px;
    grid-template-columns: 3fr 1fr 1fr;
    grid-template-areas: 'badge badge badge . review';

    .badge {
      grid-area: badge;
    }
    .review {
      grid-area: review;
    }
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
