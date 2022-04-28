import React from 'react';
import styled from 'styled-components';
import { KeypointVertex } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import {
  RowData,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import {
  KeyboardShortCutExpandChildSelectable,
  KeyboardShortCutSelectable,
  KeypointRow,
  SidePanelRow,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/components/common';

/**
 * Annotation detail Component for a row of a single keypoint
 * @param additionalData
 * @constructor
 */

export const KeypointReviewRow = ({
  additionalData,
}: VirtualizedTreeRowProps<RowData<KeypointVertex>>) => {
  const {
    callbacks: { onKeypointSelect },
    ...keypoint
  } = additionalData;

  return (
    <KeyboardShortCutSelectable id={keypoint.id} selected={keypoint.selected}>
      <KeyboardShortCutExpandChildSelectable
        id={keypoint.id}
        selected={keypoint.selected}
        key={additionalData.id}
      >
        <SidePanelRow>
          <CollapseRowContainer
            onClick={() => {
              if (onKeypointSelect) {
                onKeypointSelect(keypoint.id);
              }
            }}
          >
            <KeypointRow keypoint={keypoint} />
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
