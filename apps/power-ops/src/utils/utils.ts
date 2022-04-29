import { CalculatedProduction } from '@cognite/power-ops-api-types';
import { DoubleDatapoint } from '@cognite/sdk';
import { PriceAreaWithData, SequenceRow } from 'types';
import sidecar from 'utils/sidecar';
import axios from 'axios';

export const CHART_COLORS: string[] = [
  '#008b8b',
  '#ffa500',
  '#00bf00',
  '#797979',
  '#006400',
  '#bdb76b',
  '#8b008b',
  '#556b2f',
  '#ff8c00',
  '#9932cc',
  '#8b0000',
  '#ef967a',
  '#9400d3',
  '#ff00ff',
  '#fbaf00',
  '#008000',
  '#4b0082',
  '#00c090',
  '#ff00ff',
  '#800000',
  '#000080',
  '#808000',
  '#800080',
  '#ff0000',
  '#ffab00',
  '#0000ff',
  '#a52a2a',
  '#00008b',
];

export const pickChartColor = (index: number) => {
  return CHART_COLORS[index % CHART_COLORS.length];
};

export const interpolateProduction = (
  lowerBoundColumn: SequenceRow,
  upperBoundColumn: SequenceRow,
  hour: number,
  shopPrice: number
) => {
  const lowerBoundValue = (lowerBoundColumn[hour + 1] as number) || 0;
  const upperBoundValue = (upperBoundColumn?.[hour + 1] as number) || 0;
  const lowerBoundPrice = (lowerBoundColumn[0] as number) || 0;
  const upperBoundPrice = (upperBoundColumn?.[0] as number) || 0;
  return linearInterpolation(
    lowerBoundValue,
    upperBoundValue,
    lowerBoundPrice,
    upperBoundPrice,
    shopPrice
  );
};

export const linearInterpolation = (
  lowerBoundProd: number,
  upperBoundProd: number,
  lowerBoundPrice: number,
  upperBoundPrice: number,
  scenarioPrice: number
): number => {
  if (scenarioPrice === lowerBoundPrice) {
    return lowerBoundProd;
  }
  return (
    lowerBoundProd +
    ((upperBoundProd - lowerBoundProd) * (scenarioPrice - lowerBoundPrice)) /
      (upperBoundPrice - lowerBoundPrice)
  );
};

export const roundWithDec = (number: number) => {
  return Math.round(number * 100) / 100;
};

export const calculateScenarioProduction = (
  scenarioPricePerHour: DoubleDatapoint[],
  sequenceRows: SequenceRow[]
): CalculatedProduction[] => {
  const production: CalculatedProduction[] = [];
  scenarioPricePerHour.forEach((scenarioPrice, hour) => {
    let lowerBoundColumn: SequenceRow = sequenceRows[0];
    let upperBoundColumn: SequenceRow = sequenceRows[0];
    sequenceRows.every((row) => {
      // Price is always column 0 in a matrix sequence
      const price = row[0] as number;
      if (price < scenarioPrice.value) {
        lowerBoundColumn = row;
        return true;
      }
      upperBoundColumn = row;
      return false;
    });

    const calculatedProduction = interpolateProduction(
      lowerBoundColumn,
      upperBoundColumn,
      hour,
      scenarioPrice.value
    );
    production.push({
      timestamp: scenarioPrice.timestamp,
      price: scenarioPrice.value,
      value: calculatedProduction * -1,
    });
  });
  return production;
};

export const downloadBidMatrices = async (
  priceArea: PriceAreaWithData,
  project: string | undefined,
  token: string | undefined
) => {
  const { powerOpsApiBaseUrl } = sidecar;

  const totalMatrixExternalId = priceArea.totalMatrixes[0].externalId;
  const plantMatrixExternalIds = priceArea.plantMatrixes
    ?.map((plant) => `&externalId=${plant.matrixes[0].externalId}`)
    .join('');
  const url = `${powerOpsApiBaseUrl}/${project}/sequence/bid-matrix?externalId=${totalMatrixExternalId}${plantMatrixExternalIds}`;
  await axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/zip',
      },
      responseType: 'blob',
    })
    .then((response) => {
      const blob: Blob = new Blob([response.data]);
      triggerDownloadFromBlob('bid-matrices.zip', blob);
    });
};

export const triggerDownloadFromBlob = (fileName: string, blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};
