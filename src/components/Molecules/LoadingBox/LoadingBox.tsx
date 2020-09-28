import React from 'react';
import { Colors } from '@cognite/cogs.js';
import CircleProgressBar from 'components/Atoms/CircleProgressBar';
import { LoadingBoxWrapper, LoadingText } from './elements';

type Props = {
  progressStatus?: {
    progress: number;
    max: number;
  };
  spinAnimate?: boolean;
  text?: string;
  backgroundColor?: string | undefined;
  textColor?: string | undefined;
};

const LoadingBox = ({
  progressStatus,
  spinAnimate = true,
  text = 'Loading...',
  backgroundColor,
  textColor,
}: Props) => {
  const progress = progressStatus ? progressStatus.progress : 0;
  const max = progressStatus ? progressStatus.max : 0;
  const percentCurrent =
    progress && max ? Math.round((100 * progress) / max) : 0;
  return (
    <LoadingBoxWrapper bgColor={backgroundColor} txtColor={textColor}>
      <CircleProgressBar
        percentage={progressStatus ? percentCurrent : 20}
        className={`loading-circle${
          spinAnimate && ' loading-circle--animated'
        }`}
        showPercentageText={progressStatus !== undefined}
        strokeColor={Colors['midblue-3'].hex()}
        trailStrokeColor={Colors['greyscale-grey4'].hex()}
        maxWidth={40}
      />
      <LoadingText>{text}</LoadingText>
    </LoadingBoxWrapper>
  );
};

export default LoadingBox;
