import { CalculatedProduction } from '@cognite/power-ops-api-types';
import { DoubleDatapoint } from '@cognite/sdk';
import { MatrixWithData, BidProcessResultWithData } from 'types';
import sidecar from 'utils/sidecar';
import axios from 'axios';
import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isYesterday from 'dayjs/plugin/isYesterday';
import duration from 'dayjs/plugin/duration';
import { History } from 'history';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isToday);
dayjs.extend(isYesterday);

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
  matrix: MatrixWithData,
  lowerBoundIndex: number,
  upperBoundIndex: number,
  hour: number,
  shopPrice: number
) => {
  const lowerBoundValue =
    (matrix.dataRows[hour][lowerBoundIndex] as number) || 0;
  const upperBoundValue =
    (matrix.dataRows[hour][upperBoundIndex] as number) || 0;
  const lowerBoundPrice =
    (matrix.columnHeaders[lowerBoundIndex] as number) || 0;
  const upperBoundPrice =
    (matrix.columnHeaders[upperBoundIndex] as number) || 0;

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
  return upperBoundPrice - lowerBoundPrice !== 0
    ? lowerBoundProd +
        ((upperBoundProd - lowerBoundProd) *
          (scenarioPrice - lowerBoundPrice)) /
          (upperBoundPrice - lowerBoundPrice)
    : 0;
};

export const roundWithDec = (number: number, decimals: number) => {
  return number.toFixed(decimals);
};

export const calculateScenarioProduction = (
  scenarioPricePerHour: DoubleDatapoint[],
  matrix: MatrixWithData
): CalculatedProduction[] => {
  const production: CalculatedProduction[] = [];
  scenarioPricePerHour.forEach((scenarioPrice, hour) => {
    let lowerBoundIndex = 1;
    let upperBoundIndex = 1;

    matrix.columnHeaders.every((price, priceIndex) => {
      // First column header is "Hour" so we start from index 1
      if (typeof price === 'string') return true;

      if (price < scenarioPrice.value) {
        lowerBoundIndex = priceIndex;
        return true;
      }
      upperBoundIndex = priceIndex;
      return false;
    });

    const calculatedProduction = interpolateProduction(
      matrix,
      lowerBoundIndex,
      upperBoundIndex,
      hour,
      scenarioPrice.value
    );

    production.push({
      timestamp: scenarioPrice.timestamp,
      price: scenarioPrice.value,
      // Multiply by (-1) all calculated production for presentation
      value: calculatedProduction * -1,
    });
  });
  return production;
};

export const fetchBidMatricesData = async (
  externalIds: string[],
  project: string | undefined,
  token: string | undefined,
  format: 'zip' | 'json' | 'csv'
) => {
  const { powerOpsApiBaseUrl } = sidecar;

  const matrixExternalIds = externalIds
    .map((id) => `externalId=${id}`)
    .join('&');

  const url = `${powerOpsApiBaseUrl}/${project}/sequence/bid-matrix?${matrixExternalIds}`;
  return axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: `application/${format}`,
    },
    responseType: format === 'json' ? 'json' : 'blob',
  });
};

export const downloadBidMatrices = async (
  bidProcessResult: BidProcessResultWithData,
  project: string | undefined,
  token: string | undefined
) => {
  if (
    bidProcessResult.totalMatrix?.externalId &&
    bidProcessResult.plantMatrixes
  ) {
    const totalMatrixExternalId = bidProcessResult.totalMatrix.externalId;
    const plantMatrixExternalIds = bidProcessResult.plantMatrixes.map(
      (plant) => plant.matrix!.externalId
    );
    await fetchBidMatricesData(
      [totalMatrixExternalId, ...plantMatrixExternalIds],
      project,
      token,
      'zip'
    ).then((response) => {
      const blob: Blob = new Blob([response.data]);
      triggerDownloadFromBlob('bid-matrices.zip', blob);
    });
  }
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

export const formatDate = (date: Date | string, timeZone?: string) => {
  const formatDate = dayjs(date).tz(timeZone);
  const timeZoneString = timeZone ? formatDate.format(' UTC Z') : '';
  if (formatDate.isToday()) {
    return `Today ${formatDate.format('HH:mm')}${timeZoneString}`;
  }
  if (formatDate.isYesterday()) {
    return `Yesterday ${formatDate.format('HH:mm')}${timeZoneString}`;
  }
  return formatDate.format('MMM DD, YYYY HH:mm') + timeZoneString;
};

export const handleLogout = (history: History) => {
  history.push('/logout');
};

export const calculateDuration = (
  startTime: Date | string,
  endTime: Date | string
) => {
  dayjs.extend(duration);

  const eventStartTime = dayjs(startTime);
  const eventEndTime = dayjs(endTime);

  if (eventStartTime && eventEndTime) {
    return dayjs.duration(eventEndTime.diff(eventStartTime)).format('H:mm:ss');
  }
  return '';
};
