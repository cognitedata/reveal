import React, { FC, Fragment } from 'react';

import orderBy from 'lodash/orderBy';

import { convertToPreviewData } from 'modules/wellSearch/utils/casings';

import DepthIndicator from './DepthIndicator/DepthIndicator';
import {
  CasingViewWrapper,
  WellName,
  CenterLine,
  RightGutter,
} from './elements';
import { CasingViewType } from './interfaces';

/**
 * This component is used to generate casings diagram
 */
const CasingView: FC<CasingViewType> = ({ casings, name }: CasingViewType) => {
  const [recentZIndex, setRecentZIndex] = React.useState(1);

  const casingsList = orderBy(casings, 'endDepth', 'desc');

  return (
    <CasingViewWrapper>
      <WellName>{name}</WellName>
      <CenterLine />
      {convertToPreviewData(casingsList).map((normalizedCasing, index) => {
        // This fires on indicator click event
        const onIndicatorClick = () => {
          // This increments casing view zindex value
          setRecentZIndex((r) => r + 1);
          return recentZIndex;
        };

        return (
          <Fragment key={normalizedCasing.id}>
            <DepthIndicator
              startDepth={normalizedCasing.startDepth}
              casingDepth={normalizedCasing.casingDepth}
              description={normalizedCasing.casingDescription}
              onClick={onIndicatorClick}
              linerCasing={normalizedCasing.linerCasing}
            />
            {/* A trick to have space in right side for lengthiest description */}
            {casings.length === index + 1 && (
              <RightGutter>{normalizedCasing.maximumDescription}</RightGutter>
            )}
          </Fragment>
        );
      })}
    </CasingViewWrapper>
  );
};

export default CasingView;
