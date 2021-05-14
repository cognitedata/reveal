import React, { useMemo } from 'react';

import { Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import exifIcon from 'src/assets/exifIcon.svg';
import { RootState } from 'src/store/rootReducer';
import { selectUpdatedFileDetails } from 'src/modules/FileDetails/fileDetailsSlice';
import {
  isProcessingFile,
  makeSelectAnnotationStatuses,
} from 'src/modules/Process/processSlice';
import { TableDataItem } from 'src/modules/Common/types';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { DeleteAnnotationsByFileIds } from 'src/store/thunks/DeleteAnnotationsByFileIds';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { AnnotationsBadge } from '../AnnotationsBadge/AnnotationsBadge';
import { AnnotationsBadgePopoverContent } from '../AnnotationsBadge/AnnotationsBadgePopoverContent';
import { Popover } from '../Popover';
import { makeSelectAnnotationCounts } from '../../annotationSlice';
import { ReviewButton } from '../ReviewButton/ReviewButton';
import { ActionMenu } from '../ActionMenu/ActionMenu';
import { Thumbnail } from '../Thumbnail/Thumbnail';

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
  const dispatch = useDispatch();

  const fileInfo = {
    id: item.id,
    uploaded: true,
    mimeType: item.mimeType,
  } as FileInfo;

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

  const handleFileDelete = () => {
    dispatch(DeleteAnnotationsByFileIds([item.id]));
    dispatch(deleteFilesById([{ id: item.id }]));
  };

  const getAnnotationCounts = useMemo(makeSelectAnnotationCounts, []);
  const annotationCounts = useSelector(({ annotationReducer }: RootState) =>
    getAnnotationCounts(annotationReducer, item.id)
  );

  const getAnnotationStatuses = useMemo(makeSelectAnnotationStatuses, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, item.id)
  );

  const reviewDisabled = isProcessingFile(annotationStatuses);

  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, String(item.id))
  );

  return (
    <MapPopupContainer style={style}>
      <div className="preview">
        <div className="image">
          <Thumbnail fileInfo={fileInfo} />
        </div>
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
          <ActionMenu
            showExifIcon={fileDetails?.geoLocation !== undefined}
            disabled={reviewDisabled}
            handleReview={handleReview}
            handleFileDelete={handleFileDelete}
            handleMetadataEdit={handleMetadataEdit}
          />
        </div>
      </div>
      <div className="footer">
        <div className="badge">
          <Popover
            placement="bottom"
            trigger="mouseenter click"
            content={AnnotationsBadgePopoverContent(
              annotationCounts,
              annotationStatuses
            )}
          >
            <>{AnnotationsBadge(annotationCounts, annotationStatuses)}</>
          </Popover>
        </div>
        <div className="review">
          <ReviewButton disabled={reviewDisabled} onClick={handleReview} />
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
  grid-template-rows: 86px 55px;
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
