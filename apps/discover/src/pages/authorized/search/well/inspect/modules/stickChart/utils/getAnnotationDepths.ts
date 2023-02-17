import { DepthMeasurementWithData } from 'domain/wells/measurements/internal/types';

import { DepthIndexTypeEnum } from '@cognite/sdk-wells';

import { AnnotationDepths } from '../types';

export const getAnnotationDepths = (
  data?: DepthMeasurementWithData[]
): AnnotationDepths | undefined => {
  if (!data) {
    return undefined;
  }

  return data.reduce(
    (result, { depthColumn: { type }, rows }) => {
      const depths = rows.map(({ depth }) => depth);

      if (type === DepthIndexTypeEnum.MeasuredDepth) {
        return {
          ...result,
          measuredDepths: [...result.measuredDepths, ...depths],
        };
      }

      return {
        ...result,
        trueVerticalDepths: [...result.measuredDepths, ...depths],
      };
    },
    {
      measuredDepths: [],
      trueVerticalDepths: [],
    } as AnnotationDepths
  );
};
