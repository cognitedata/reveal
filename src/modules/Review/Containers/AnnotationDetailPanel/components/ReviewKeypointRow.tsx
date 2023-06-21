import React from 'react';
import styled from 'styled-components';
import {
  AnnotationDetailPanelRowDataBase,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import {
  KeyboardShortCutExpandChildSelectable,
  KeyboardShortCutSelectable,
  SidePanelRow,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components/common';
import { ReviewKeypoint } from 'src/modules/Review/types';
import { KeypointRowContent } from 'src/modules/Review/Containers/AnnotationDetailPanel/components/common/KeypointRowContent';

/**
 * Annotation detail Component for a row of a single keypoint
 * @param additionalData
 * @constructor
 */

export const ReviewKeypointRow = ({
  additionalData,
}: VirtualizedTreeRowProps<
  AnnotationDetailPanelRowDataBase<ReviewKeypoint>
>) => {
  const {
    common: { index, color },
    callbacks: { onKeypointSelect },
    ...reviewKeypoint
  } = additionalData;

  return (
    <KeyboardShortCutSelectable
      id={reviewKeypoint.id}
      selected={reviewKeypoint.selected}
    >
      <KeyboardShortCutExpandChildSelectable
        id={reviewKeypoint.id}
        selected={reviewKeypoint.selected}
        key={additionalData.id}
      >
        <SidePanelRow>
          <CollapseRowContainer
            onClick={() => {
              if (onKeypointSelect) {
                onKeypointSelect(reviewKeypoint.id);
              }
            }}
          >
            <KeypointRowContent
              label={reviewKeypoint.label}
              // given that a keypoint is set, the corresponding color (which
              // belongs to its keypoint collection) must also exist
              keypointColor={color!}
              keypointIndex={index}
            />
          </CollapseRowContainer>
        </SidePanelRow>
      </KeyboardShortCutExpandChildSelectable>
    </KeyboardShortCutSelectable>
  );
};

const CollapseRowContainer = styled.div`
  padding: 0 30px;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
`;
