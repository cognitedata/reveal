import React from 'react';
import styled from 'styled-components';
import {
  AnnotationDetailPanelRowDataBase,
  VirtualizedTreeRowProps,
} from 'src/modules/Review/Containers/AnnotationDetailPanel/types';
import { SidePanelRow } from 'src/modules/Review/Containers/AnnotationDetailPanel/components/common';
import { PredefinedKeypoint } from 'src/modules/Review/types';
import { KeypointRowContent } from 'src/modules/Review/Containers/AnnotationDetailPanel/components/common/KeypointRowContent';

/**
 * Annotation detail Component for a row of a single predefined keypoint
 * @param additionalData
 * @constructor
 */

export const PredefinedKeypointRow = ({
  additionalData,
}: VirtualizedTreeRowProps<
  AnnotationDetailPanelRowDataBase<PredefinedKeypoint>
>) => {
  const {
    common: { index, color },
    ...predefinedKeypoint
  } = additionalData;

  return (
    <SidePanelRow id={predefinedKeypoint.caption}>
      <CollapseRowContainer>
        <KeypointRowContent
          label={predefinedKeypoint.caption}
          keypointIndex={index}
          keypointColor={color!}
          remaining
        />
      </CollapseRowContainer>
    </SidePanelRow>
  );
};

const CollapseRowContainer = styled.div`
  padding: 0 30px;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
`;
