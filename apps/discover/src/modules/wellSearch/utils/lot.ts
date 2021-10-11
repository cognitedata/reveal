import get from 'lodash/get';
import { Data } from 'plotly.js';

import { Sequence } from '@cognite/sdk';

import { log } from '_helpers/log';
import { PPG } from 'constants/units';

import { convertPressure } from './common';

// This is used to format sequence data according to the plotly chart data patten
export const convertToPlotly = (
  sequence: Sequence,
  fieldInfo: { [key: string]: string } = {},
  pressureUnit: string = PPG
): Data | null => {
  const requiredFields = ['pressure', 'tvd', 'tvdUnit', 'pressureUnit'];

  const isRequiredFieldsAvailable =
    requiredFields.filter((requiredField) =>
      Object.keys(fieldInfo).includes(requiredField)
    ).length !== requiredFields.length;

  if (isRequiredFieldsAvailable) {
    log('Require field informations are not configured for LOT');
    return null;
  }
  const xVal = Number(get(sequence, fieldInfo.pressure, 0));
  const yVal = Number(get(sequence, fieldInfo.tvd, 0));
  const tvdUnit = get(sequence, fieldInfo.tvdUnit);
  const currentPressureUnit = get(sequence, fieldInfo.pressureUnit);

  return {
    x: [
      convertPressure(xVal, currentPressureUnit, yVal, tvdUnit, pressureUnit),
    ],
    y: [yVal],
    type: 'scatter',
    mode: 'markers',
    marker: {
      color: 'rgb(0, 255, 0)',
      size: 20,
      symbol: 'diamond',
    },
    name: `LOT - ${sequence.description || sequence.name}`,
    hovertemplate: `%{y}`,
    showlegend: false,
  };
};
