import React, { useState } from 'react';

import { Data, PlotData } from 'plotly.js';

import { BaseButton } from 'components/buttons';
import { Wellbore } from 'modules/wellSearch/types';

import { ChartV2 } from '../../common/ChartV2';
import CurveColorCode from '../../common/ChartV2/CurveColorCode';

import {
  CurveIndicator,
  Footer,
  Header,
  HeaderSubTitle,
  HeaderTitle,
  HeaderTitleContainer,
  LegendsHolder,
  Wrapper,
} from './elements';

type AxisNames = {
  x: string;
  y: string;
  x2?: string;
};

type Props = {
  wellbore: Wellbore;
  chartData: Data[];
  axisNames: AxisNames;
};

export const WellCentricCard: React.FC<Props> = ({
  wellbore,
  chartData,
  axisNames,
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);
  const legendsHolderRef = React.useRef<HTMLDivElement>(null);
  const displayShowAll = (legendsHolderRef?.current?.scrollHeight || 0) > 16;

  return (
    <Wrapper>
      <Header>
        <HeaderTitleContainer>
          <HeaderTitle>{wellbore.metadata?.wellName}</HeaderTitle>
          <HeaderSubTitle>
            {wellbore.description} {wellbore.name}
          </HeaderSubTitle>
        </HeaderTitleContainer>
      </Header>
      <ChartV2
        data={chartData}
        axisNames={axisNames}
        axisAutorange={{
          y: 'reversed',
        }}
        title="Internal Friction Angle & Pore Pressure Fracture Gradient"
        autosize
      />
      <Footer>
        <LegendsHolder expanded={showAll} ref={legendsHolderRef}>
          {(chartData as Partial<PlotData>[]).map((row) => (
            <CurveIndicator
              key={`${wellbore.description}-${
                (row?.customdata as string[])[0]
              }`}
            >
              <CurveColorCode line={row.line} marker={row.marker} />
              <span>{(row?.customdata as string[])[0]}</span>
            </CurveIndicator>
          ))}
        </LegendsHolder>

        <BaseButton
          hidden={!displayShowAll}
          type="ghost"
          size="small"
          icon={showAll ? 'ChevronUpCompact' : 'ChevronDownCompact'}
          text={showAll ? 'Hide all' : 'Show all'}
          aria-label={showAll ? 'Hide all' : 'Show all'}
          onClick={() => setShowAll(!showAll)}
        />
      </Footer>
    </Wrapper>
  );
};

export default WellCentricCard;
