import React from 'react';

import styled from 'styled-components';

import { SidePanelRow } from '@vision/modules/Review/Containers/AnnotationDetailPanel/components/common';
import { KeypointRowContent } from '@vision/modules/Review/Containers/AnnotationDetailPanel/components/common/KeypointRowContent';
import {
  AnnotationDetailPanelRowDataBase,
  VirtualizedTreeRowProps,
} from '@vision/modules/Review/Containers/AnnotationDetailPanel/types';
import { PredefinedKeypoint } from '@vision/modules/Review/types';

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
