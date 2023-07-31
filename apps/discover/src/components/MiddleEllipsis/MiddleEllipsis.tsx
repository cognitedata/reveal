import React, { useRef } from 'react';

import { DEFAULT_TOOLTIP_PLACEMENT } from 'components/Buttons';
import { Tooltip } from 'components/Tooltip';
import { useElementOverflowing } from 'hooks/useElementOverflowing';

import {
  MiddleEllipsisContainer,
  MiddleEllipsisContent,
  RelativeText,
  FixedText,
} from './element';

export interface MiddleEllipsisProps {
  value: string;
  fixedLength?: number;
}

export const MiddleEllipsis: React.FC<MiddleEllipsisProps> = ({
  value,
  fixedLength,
}) => {
  const ref = useRef<HTMLElement>();

  const showTooltip = useElementOverflowing(ref?.current);

  return (
    <MiddleEllipsisContainer data-testid="middle-ellipsis">
      <Tooltip
        title={value}
        key={value}
        enabled={showTooltip}
        placement={DEFAULT_TOOLTIP_PLACEMENT}
      >
        {getMiddleEllipsisWrapper({ value, ref }, fixedLength)}
      </Tooltip>
    </MiddleEllipsisContainer>
  );
};

export const getMiddleEllipsisWrapper = (
  {
    value,
    ref,
  }: {
    value?: string;
    ref?: React.MutableRefObject<HTMLElement | undefined>;
  },
  fixedLength = 10
): React.ReactElement => {
  if (value === undefined) {
    return <></>;
  }
  // spotted a case where the input might be a number.
  if (typeof value !== 'string') {
    return value;
  }

  const textBreakLength = value.length - fixedLength;
  const isValueGreaterThanFixedLength = value.length > fixedLength;

  return (
    <MiddleEllipsisContent aria-label={value} title={value}>
      {isValueGreaterThanFixedLength ? (
        <>
          <RelativeText ref={ref}>
            {value.slice(0, textBreakLength)}
          </RelativeText>
          <FixedText>{value.slice(textBreakLength)}</FixedText>
        </>
      ) : (
        <RelativeText ref={ref}>{value}</RelativeText>
      )}
    </MiddleEllipsisContent>
  );
};
