import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import styled from 'styled-components';

import { Button, Tooltip } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';

import ExifIcon from '../../../../assets/exifIcon';
import { useThunkDispatch } from '../../../../store';
import { RootState } from '../../../../store/rootReducer';
import { DeleteFilesById } from '../../../../store/thunks/Files/DeleteFilesById';
import { selectUpdatedFileDetails } from '../../../FileDetails/selectors';
import { makeSelectJobStatusForFile } from '../../../Process/store/selectors';
import { isProcessingFile } from '../../../Process/store/utils';
import { makeSelectTotalAnnotationCountForFileIds } from '../../store/annotation/selectors';
import { TableDataItem } from '../../types';
import { ActionMenu } from '../ActionMenu/ActionMenu';
import { AnnotationsBadgePopover } from '../AnnotationsBadge/AnnotationBadgePopover';
import { Thumbnail } from '../Thumbnail/Thumbnail';

export const MapPopup = ({
  item,
  style,
  onClose,
  actionDisabled,
}: {
  item: TableDataItem;
  style?: React.CSSProperties;
  actionDisabled: boolean;
  onClose: () => void;
}) => {
  const dispatch = useThunkDispatch();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { menuActions, rowKey, ...fileInfo } = item;

  const handleReview = () => {
    if (menuActions.onReviewClick)
      menuActions.onReviewClick(fileInfo as FileInfo);
  };

  const handleFileDetails = () => {
    if (menuActions.onFileDetailsClicked)
      menuActions.onFileDetailsClicked(fileInfo as FileInfo);
  };

  const handleFileDelete = () => {
    dispatch(DeleteFilesById({ fileIds: [item.id] }));
  };

  const selectTotalAnnotationCountForFileIds = useMemo(
    makeSelectTotalAnnotationCountForFileIds,
    []
  );
  const annotationCounts = useSelector(({ annotationReducer }: RootState) =>
    selectTotalAnnotationCountForFileIds(annotationReducer, [item.id])
  );

  const getAnnotationStatuses = useMemo(makeSelectJobStatusForFile, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, item.id)
  );

  const reviewDisabled = isProcessingFile(annotationStatuses);

  const fileDetails = useSelector((state: RootState) =>
    selectUpdatedFileDetails(state, item.id)
  );

  return (
    <MapPopupContainer style={style}>
      <div className="preview">
        <div className="image">
          <Thumbnail fileInfo={fileInfo as FileInfo} />
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
                      <Tooltip content="Geolocated">
                        <StyledExifIcon />
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
        <div className="close">
          <Button
            type="ghost"
            icon="Close"
            size="small"
            aria-label="close popup"
            onClick={onClose}
          />
        </div>
      </div>
      <div className="footer">
        <div className="badge">
          {AnnotationsBadgePopover(annotationCounts, annotationStatuses)}
        </div>
        <div className="action">
          <ActionMenu
            showExifIcon={fileDetails?.geoLocation !== undefined}
            reviewDisabled={reviewDisabled}
            actionDisabled={actionDisabled}
            handleReview={handleReview}
            handleFileDelete={handleFileDelete}
            handleFileDetails={handleFileDetails}
          />
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
    grid-template-areas: 'image fileDetails close';

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
        max-width: 150px;
      }
    }

    .close {
      grid-area: close;
      justify-self: end;
      padding-right: 12px;
      padding-top: 2px;
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
    grid-template-areas: 'badge badge badge . action';

    .badge {
      grid-area: badge;
    }
    .action {
      grid-area: action;
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

const StyledExifIcon = styled(ExifIcon)`
  width: 11px;
  padding-bottom: 15px;
`;
