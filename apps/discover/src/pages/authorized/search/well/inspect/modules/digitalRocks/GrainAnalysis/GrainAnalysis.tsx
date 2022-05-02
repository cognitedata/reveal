import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { Data } from 'plotly.js';

import { Asset } from '@cognite/sdk';

import EmptyState from 'components/EmptyState';
import { DIGITAL_ROCK_SAMPLES_ACCESSORS } from 'modules/wellSearch/constants';
import { useGrainPartionings } from 'modules/wellSearch/selectors/sequence/grainAnalysis';
import { convertToPlotly } from 'modules/wellSearch/utils/grainAnalysis';
import { FlexGrow } from 'styles/layout';

import {
  DEVELOPMENT_INPROGRESS,
  EMPTY_CHART_DATA_MESSAGE,
} from '../../../constants';
import { Chart } from '../../common/Chart';
import { MessageWrapper } from '../../common/elements';
import ValueSelector from '../../common/ValueSelector';

import { SelectorRow } from './elements';

export type Props = {
  digitalRockSample: Asset;
};

const typeSelections = [
  { id: 1, value: 'percentage', title: 'Percentage', default: true },
  { id: 2, value: 'count', title: 'Count' },
  { id: 3, value: 'volumeFraction', title: 'Volume Fraction' },
];

const curveSelections = [
  { id: 1, value: 'ElasticEMT' },
  { id: 2, value: 'FF' },
  { id: 3, value: 'GPART', title: 'Grain Partitioning', default: true },
  { id: 4, value: 'MICP' },
  { id: 5, value: 'PC' },
  { id: 6, value: 'RI' },
  { id: 7, value: 'SPF' },
  { id: 8, value: 'TPCF' },
];

const typeCurveMap: { [key: string]: string } = {
  percentage: 'COUNT_PERCENT_OF_PARTICLES',
  count: 'NUMBER_OF_PARTICLES',
  volumeFraction: 'CUM_VOLUME_FRACTION_BIN',
};

const typeSufixMap: { [key: string]: string } = {
  percentage: '%',
};

const xCurve = 'GRAIN_DIAMETER_BIN';

const xAxisName = 'Grain Diameter (microns)';

export const GrainAnalysis: React.FC<Props> = ({ digitalRockSample }) => {
  const { t } = useTranslation('WellData');

  const [curve, setCurve] = useState<string>(
    curveSelections.find((row) => row.default)?.value as string
  );
  const [type, setType] = useState<string>(
    typeSelections.find((row) => row.default)?.value as string
  );

  const { isLoading, grainPartionings } =
    useGrainPartionings(digitalRockSample);

  // INFO: this will be refactored in another PR
  const sampleVolumeId = get(
    digitalRockSample,
    DIGITAL_ROCK_SAMPLES_ACCESSORS.VOLUME_ID
  );
  const title = `Grain Analysis${sampleVolumeId ? ` - ${sampleVolumeId}` : ''}`;

  const onTypeChange = (value: string) => {
    setType(value);
  };

  const onCurveChange = (value: string) => {
    setCurve(value);
  };

  let grainAnalysisData = {
    chartData: [] as Data[],
  };

  if (grainPartionings) {
    grainAnalysisData = convertToPlotly(
      grainPartionings,
      [xCurve],
      typeCurveMap[type]
    );
  }

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }

  let ChartContent;

  if (curve !== 'GPART') {
    ChartContent = <MessageWrapper>{t(DEVELOPMENT_INPROGRESS)}</MessageWrapper>;
  } else if (isEmpty(grainAnalysisData.chartData)) {
    ChartContent = (
      <MessageWrapper>{t(EMPTY_CHART_DATA_MESSAGE)}</MessageWrapper>
    );
  } else {
    ChartContent = (
      <div data-testid="grain-partition-chart">
        <Chart
          data={grainAnalysisData.chartData}
          axisNames={{
            x: xAxisName,
            y: ' ',
          }}
          axisTicksuffixes={{ y: typeSufixMap[type] }}
          title={title}
        />
      </div>
    );
  }

  return (
    <div data-testid="grain-parition-modal">
      <SelectorRow>
        <ValueSelector selections={typeSelections} onChange={onTypeChange} />
        <FlexGrow />
        <ValueSelector selections={curveSelections} onChange={onCurveChange} />
      </SelectorRow>
      {ChartContent}
    </div>
  );
};

export default GrainAnalysis;
