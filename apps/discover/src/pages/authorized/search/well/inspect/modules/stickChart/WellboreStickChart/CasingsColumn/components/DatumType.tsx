import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import * as React from 'react';

import { useScaledDepth } from '../../../hooks/useScaledDepth';
import { getDatumTypeDisplay } from '../../../utils/getDatumTypeDisplay';
import { getDepthTagDisplayDepth } from '../../../utils/getDepthTagDisplayDepth';
import { TopContentWrapper } from '../elements';

import { DepthLimitTag } from './DepthTag';

export interface DatumTypeProps {
  datum: WellboreInternal['datum'];
  scaleBlocks: number[];
}

export const DatumType: React.FC<DatumTypeProps> = ({ datum, scaleBlocks }) => {
  const getScaledDepth = useScaledDepth(scaleBlocks);

  const renderTotalDepthTag = () => {
    if (!datum) {
      return <DepthLimitTag content="No data" scaledDepth={0} />;
    }

    const { reference, value } = datum;

    const datumTypeDisplay = getDatumTypeDisplay(reference);
    const datumValueDisplay = getDepthTagDisplayDepth(value);

    return (
      <DepthLimitTag
        content={`${datumTypeDisplay}: ${datumValueDisplay}`}
        scaledDepth={getScaledDepth(value)}
      />
    );
  };

  return <TopContentWrapper>{renderTotalDepthTag()}</TopContentWrapper>;
};
