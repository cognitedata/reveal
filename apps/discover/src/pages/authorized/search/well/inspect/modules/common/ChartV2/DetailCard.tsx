import { useMemo } from 'react';

import { FlexColumn } from 'styles/layout';

import CurveColorCode from './CurveColorCode';
import {
  DetailcardBlock,
  DetailcardBlockContent,
  DetailcardBlockHeader,
  DetailcardMainRow,
  DetailcardSubRow,
  DetailcardWrapper,
  DetailcardBlockFull,
} from './elements';
import { getChartDisplayValues, getChartPositionValues } from './utils';

type Props = {
  data?: Plotly.PlotMouseEvent;
};

const DetailCard = ({ data }: Props) => {
  const position = useMemo(() => getChartPositionValues(data), [data]);
  const displayValues = useMemo(() => getChartDisplayValues(data), [data]);
  return (
    <DetailcardWrapper {...position} className="plotly-chart-detail-card">
      <DetailcardMainRow>
        <CurveColorCode
          line={displayValues.line}
          marker={displayValues.marker}
        />
        <FlexColumn>
          <DetailcardBlockHeader>
            {displayValues.customdata[0]}
          </DetailcardBlockHeader>
          {displayValues.customdata[1] && (
            <DetailcardBlockContent>
              {displayValues.customdata[1]}
            </DetailcardBlockContent>
          )}
        </FlexColumn>
      </DetailcardMainRow>
      <DetailcardSubRow>
        <DetailcardBlock>
          <DetailcardBlockHeader>{displayValues.yTitle}</DetailcardBlockHeader>
          <DetailcardBlockContent>
            {Number(displayValues.y).toFixed(2)}
          </DetailcardBlockContent>
        </DetailcardBlock>
        <DetailcardBlockFull>
          <DetailcardBlockHeader>{displayValues.xTitle}</DetailcardBlockHeader>
          <DetailcardBlockContent>
            {Number(displayValues.x).toFixed(2)}
          </DetailcardBlockContent>
        </DetailcardBlockFull>
      </DetailcardSubRow>
    </DetailcardWrapper>
  );
};

export default DetailCard;
