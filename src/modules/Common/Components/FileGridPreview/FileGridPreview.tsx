import React, { useMemo } from 'react';
import { Tooltip } from '@cognite/cogs.js';
import { ActionMenu } from 'src/modules/Common/Components/ActionMenu/ActionMenu';
import { ReviewButton } from 'src/modules/Common/Components/ReviewButton/ReviewButton';
import { SelectionCheckbox } from 'src/modules/Common/Components/SelectionCheckbox/SelectionCheckbox';
import { Thumbnail } from 'src/modules/Common/Components/Thumbnail/Thumbnail';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import exifIcon from 'src/assets/exifIcon.svg';
import { RootState } from 'src/store/rootReducer';
import { isProcessingFile } from 'src/modules/Process/store/utils';
import { makeSelectJobStatusForFile } from 'src/modules/Process/store/selectors';
import { TableDataItem } from 'src/modules/Common/types';
import { FileInfo } from '@cognite/sdk';
import { VisionMode } from 'src/constants/enums/VisionEnums';
import { makeSelectTotalAnnotationCountForFileIds } from 'src/modules/Common/store/annotationV1/selectors';
import { AnnotationsBadgePopover } from 'src/modules/Common/Components/AnnotationsBadge/AnnotationBadgePopover';

export const FileGridPreview = ({
  item,
  style,
  mode,
  isActionDisabled,
  onItemSelect,
  isSelected,
}: {
  item: TableDataItem;
  style?: React.CSSProperties;
  mode: VisionMode;
  isActionDisabled: () => boolean;
  onItemSelect?: (item: TableDataItem, selected: boolean) => void;
  isSelected: (id: number) => boolean;
}) => {
  const selected = isSelected(item.id);
  const actionDisabled = isActionDisabled();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { menuActions, rowKey, ...fileInfo } = item;

  const handleReview = (evt: any) => {
    if (menuActions.onReviewClick) {
      menuActions.onReviewClick(fileInfo as FileInfo);
    }
    // stop event propagation from here to stop triggering button underneath the overlay
    evt.stopPropagation();
  };

  const handleFileDetails = () => {
    if (menuActions.onFileDetailsClicked)
      menuActions.onFileDetailsClicked(fileInfo as FileInfo);
  };

  const handleFileDelete = () => {
    if (menuActions.onFileDelete) menuActions.onFileDelete(item.id);
  };

  const selectTotalAnnotationCountForFileIds = useMemo(
    makeSelectTotalAnnotationCountForFileIds,
    []
  );
  const annotationCounts = useSelector(({ annotationV1Reducer }: RootState) =>
    selectTotalAnnotationCountForFileIds(annotationV1Reducer, [item.id])
  );

  const getAnnotationStatuses = useMemo(makeSelectJobStatusForFile, []);
  const annotationStatuses = useSelector(({ processSlice }: RootState) =>
    getAnnotationStatuses(processSlice, item.id)
  );

  const reviewDisabled = isProcessingFile(annotationStatuses);

  const showReviewButton = mode === VisionMode.Contextualize;

  return (
    <PreviewCell style={style} onClick={handleFileDetails}>
      <div className="preview">
        <Thumbnail
          fileInfo={fileInfo as FileInfo}
          onViewClicked={showReviewButton ? undefined : handleReview} // because view button should only be shown in explorer page
        />
        {onItemSelect && (
          <SelectionCheckbox
            dataItem={item}
            selected={selected}
            handleItemSelect={onItemSelect}
          />
        )}

        <MenuContainer>
          <ActionMenu
            buttonType="primary"
            showExifIcon={item?.geoLocation !== undefined}
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
            {item?.geoLocation && (
              <Tooltip content="EXIF data added">
                <div className="exif">
                  <img src={exifIcon} alt="exifIcon" />
                </div>
              </Tooltip>
            )}
          </div>

          <div className="badge">
            {AnnotationsBadgePopover(annotationCounts, annotationStatuses)}
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
  top: 0;
  right: 0;
  margin: 8px 24px 0 0;
`;

const PreviewCell = styled.div`
  padding: 0 16px 16px 0;
  .preview {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
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
      box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    }
  }

  .cogs-body-1 {
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
  }
`;
