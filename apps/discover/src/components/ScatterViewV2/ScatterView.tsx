import { useCallback, useEffect, useRef, useState } from 'react';

import isUndefined from 'lodash/isUndefined';
import { BooleanMap } from 'utils/booleanMap';
import { isOverflow } from 'utils/isOverflow';

import { Dropdown, DropdownProps } from '@cognite/cogs.js';
import { EventSource } from '@cognite/sdk-wells';

import { EMPTY_OBJECT } from 'constants/empty';

import {
  OverflowActionWrapper,
  Scatter,
  ScattersContainer,
  ScatterViewWrapper,
} from './elements';

export const DEFAULT_SCATTER_COLOR = '#595959';

export interface ScatterViewProps<T> {
  data: T[];
  colorAccessor?: keyof T;
  highlightScatterIndex?: number;
  onClickScatter?: (dataElement: T, index: number) => void;
  renderScatterDetails?: (dataElement: T) => JSX.Element;
  scatterDetailsPlacement?: DropdownProps['placement'];
  renderOverflowAction?: (data: T[]) => JSX.Element;
  highlightedEventsMap?: BooleanMap;
}

export const ScatterView = <T extends { source: EventSource }>({
  data,
  colorAccessor,
  highlightScatterIndex,
  onClickScatter,
  renderScatterDetails,
  scatterDetailsPlacement,
  renderOverflowAction,
  highlightedEventsMap = EMPTY_OBJECT as BooleanMap,
}: ScatterViewProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isScattersOverflow, setScattersOverflow] = useState(false);

  const getScatterColor = (dataElement: T) => {
    if (!colorAccessor) {
      return DEFAULT_SCATTER_COLOR;
    }
    return dataElement[colorAccessor] || DEFAULT_SCATTER_COLOR;
  };

  const updateScattersOverflowStatus = useCallback(() => {
    setScattersOverflow(
      Boolean(containerRef.current && isOverflow(containerRef.current))
    );
  }, [containerRef.current?.scrollWidth]);

  useEffect(() => {
    updateScattersOverflowStatus();
  }, [updateScattersOverflowStatus]);

  const getScatterOpacity = (index: number) => {
    if (isUndefined(highlightScatterIndex) || index === highlightScatterIndex) {
      return 1;
    }
    return 0.5;
  };

  return (
    <ScatterViewWrapper>
      <ScattersContainer
        ref={containerRef}
        overflow={renderOverflowAction ? 'hidden' : 'auto'}
      >
        {data.map((dataElement, index) => {
          const { eventExternalId } = dataElement.source;

          return (
            <Dropdown
              key={`scatter-${eventExternalId}`}
              placement={scatterDetailsPlacement}
              content={renderScatterDetails?.(dataElement)}
            >
              <Scatter
                color={getScatterColor(dataElement)}
                $pointer={Boolean(renderScatterDetails || onClickScatter)}
                $highlighted={Boolean(highlightedEventsMap[eventExternalId])}
                opacity={getScatterOpacity(index)}
                onClick={() => onClickScatter?.(dataElement, index)}
              />
            </Dropdown>
          );
        })}
      </ScattersContainer>

      {renderOverflowAction && isScattersOverflow && (
        <OverflowActionWrapper>
          {renderOverflowAction(data)}
        </OverflowActionWrapper>
      )}
    </ScatterViewWrapper>
  );
};
