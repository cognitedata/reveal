import React from 'react';

import styled from 'styled-components';

import { PredefinedKeypoint } from '../../../types';
import {
  AnnotationDetailPanelRowDataBase,
  VirtualizedTreeRowProps,
} from '../types';

import { SidePanelRow } from './common';
import { KeypointRowContent } from './common/KeypointRowContent';

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
