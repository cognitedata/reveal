import React, { useMemo } from 'react';

import { Tooltip } from '@cognite/cogs.js';
import { Popover } from 'src/modules/Common/Components/Popover';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import exifIcon from 'src/assets/exifIcon.svg';
import { RootState } from 'src/store/rootReducer';
import {
  isProcessingFile,
  makeSelectAnnotationStatuses,
} from 'src/modules/Process/processSlice';
import { selectUpdatedFileDetails } from 'src/modules/FileDetails/fileDetailsSlice';
import { TableDataItem } from 'src/modules/Common/types';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { DeleteAnnotationsByFileIds } from 'src/store/thunks/DeleteAnnotationsByFileIds';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { VisionMode } from 'src/constants/enums/VisionEnums';
import { AnnotationsBadge } from '../AnnotationsBadge/AnnotationsBadge';
import { AnnotationsBadgePopoverContent } from '../AnnotationsBadge/AnnotationsBadgePopoverContent';
import { makeSelectAnnotationCounts } from '../../annotationSlice';
import { ReviewButton } from '../ReviewButton/ReviewButton';
import { ActionMenu } from '../ActionMenu/ActionMenu';
import { Thumbnail } from '../Thumbnail/Thumbnail';
import { SelectionCheckbox } from '../SelectionCheckbox/SelectionCheckbox';

export const FileGridPreview = ({
  item,
  style,
  mode,
  actionDisabled,
  onSelect,
  selected,
}: {
  selected: boolean;
  item: TableDataItem;
  style?: React.CSSProperties;
  mode: VisionMode;
  actionDisabled: boolean;
  onSelect?: (item: TableDataItem, selected: boolean) => void;
}) => {
  const dispatch = useDispatch();
  const { menuActions, ...fileInfo } = item;

  const handleReview = () => {
    if (menuActions.onReviewClick)
      menuActions.onReviewClick(fileInfo as FileInfo);
  };

  const handleFileDetails = () => {
    if (menuActions.onFileDetailsClicked)
      menuActions.onFileDetailsClicked(fileInfo as FileInfo);
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
    selectUpdatedFileDetails(state, item.id)
  );

  const showReviewButton = mode === VisionMode.Contextualize;

  return (
    <PreviewCell style={style}>
      <div className="preview">
        <Thumbnail fileInfo={fileInfo as FileInfo} />
        {onSelect && (
          <SelectionCheckbox
            dataItem={item}
            selected={selected}
            handleItemSelect={onSelect}
          />
        )}

        <MenuContainer>
          <ActionMenu
            buttonType="primary"
            showExifIcon={fileDetails?.geoLocation !== undefined}
            reviewDisabled={reviewDisabled}
            actionDisabled={actionDisabled}
            handleReview={showReviewButton ? undefined : handleReview} // skip menu item if button is shown
            handleFileDelete={handleFileDelete}
            handleFileDetails={handleFileDetails}
          />
        </MenuContainer>
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
          {showReviewButton && (
            <div className="review">
              <ReviewButton disabled={reviewDisabled} onClick={handleReview} />
            </div>
          )}
        </div>
      </div>
    </PreviewCell>
  );
};

const MenuContainer = styled.div`
  position: absolute;
  top: 7px;
  right: calc(10% + 7px);
`;

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
      grid-template-columns: 120px 1fr 1fr;
      grid-template-rows: auto;
      grid-template-areas:
        'name name name name . .'
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
        max-width: 100px;
      }
      .exif > img {
        padding-bottom: 15px;
        grid-area: name;
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
`;
