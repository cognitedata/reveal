import React, { useRef } from 'react';

import { DEFAULT_TOOLTIP_PLACEMENT } from 'components/buttons';
import { Tooltip } from 'components/tooltip';
import { useElementOverflowing } from 'hooks/useElementOverflowing';

import {
  MiddleEllipsisContainer,
  MiddleEllipsisContent,
  RelativeText,
  FixedText,
} from './element';

export const MiddleEllipsis: React.FC<{ value: string; fixedLength?: number }> =
  ({ value, fixedLength }) => {
    const ref = useRef<HTMLElement>();

    const showTooltip = useElementOverflowing(ref?.current);

    return (
      <MiddleEllipsisContainer>
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
  if (typeof value !== 'string') return value;

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
