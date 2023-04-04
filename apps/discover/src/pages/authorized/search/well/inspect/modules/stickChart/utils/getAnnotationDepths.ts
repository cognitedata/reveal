import { EMPTY_ARRAY } from 'constants/empty';

import { AnnotationDepths, CasingAssemblyView } from '../types';

export const getAnnotationDepths = (
  data?: CasingAssemblyView[]
): AnnotationDepths | undefined => {
  if (!data) {
    return undefined;
  }

  return data.reduce(
    (result, { measuredDepthBase, trueVerticalDepthBase }) => {
      return {
        ...result,
        measuredDepths: [...result.measuredDepths, measuredDepthBase.value],
        trueVerticalDepths: trueVerticalDepthBase
          ? [...result.trueVerticalDepths, trueVerticalDepthBase.value]
          : result.trueVerticalDepths,
      };
    },
    {
      measuredDepths: EMPTY_ARRAY,
      trueVerticalDepths: EMPTY_ARRAY,
    } as AnnotationDepths
  );
};
