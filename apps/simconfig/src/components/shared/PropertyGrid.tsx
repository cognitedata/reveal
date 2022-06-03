import React, { useMemo } from 'react';

import classNames from 'classnames';
import styled from 'styled-components/macro';

import { Tooltip } from '@cognite/cogs.js';

import { CopyValue } from 'components/molecules/CopyValue';
import { getFormattedSciNumber } from 'utils/numberUtils';

export interface PropertyGridProps<T> {
  entries: Record<string, T>;
  formatEntry?: ({ key, entry }: { key: string; entry: T }) => JSX.Element;
  sortEntries?: boolean;
}

export function PropertyGrid<T>({
  entries,
  formatEntry,
  sortEntries = true,
}: PropertyGridProps<T>) {
  function getEntries() {
    if (sortEntries) {
      return Object.entries(entries).sort(([a], [b]) => a.localeCompare(b));
    }
    return Object.entries(entries);
  }

  return (
    <PropertyGridContainer>
      {getEntries().map(([key, entry]) => (
        <React.Fragment key={`property-grid-${key}`}>
          <dt>{key}</dt>
          <dd>{formatEntry?.({ key, entry }) ?? entry}</dd>
        </React.Fragment>
      ))}
    </PropertyGridContainer>
  );
}

export const PropertyGridContainer = styled.dl`
  margin: 24px;
  display: grid;
  grid-auto-flow: dense;
  gap: 3px 12px;
  @media (min-width: 600px) {
    & > :nth-of-type(2n + 1) {
      grid-column: 1;
    }
    & > :nth-of-type(2n + 2) {
      grid-column: 2;
    }
  }
  @media (min-width: 1200px) {
    & > :nth-of-type(3n + 1) {
      grid-column: 1;
    }
    & > :nth-of-type(3n + 2) {
      grid-column: 2;
    }
    & > :nth-of-type(3n + 3) {
      grid-column: 3;
    }
  }
  dt {
    &::after {
      content: ':';
    }
  }
  dt {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  dd {
    white-space: nowrap;
  }
  .unit {
    opacity: 0.7;
    font-size: var(--cogs-detail-font-size);
    margin-left: 6px;
  }
  .undefined {
    opacity: 0.5;
  }
  .higher,
  .lower {
    cursor: help;
  }
  .higher {
    color: var(--cogs-green-3);
  }
  .higher-value span {
    background: var(--cogs-green-8);
    color: var(--cogs-green-1);
  }
  .lower {
    color: var(--cogs-red-3);
  }
  .lower-value span {
    background: var(--cogs-red-8);
    color: var(--cogs-red-1);
  }
  .arrow {
    margin-left: 6px;
  }
`;

export type ValueUnitType = Partial<
  Record<string, { value: number; unit: string; previousValue?: number }>
>;

export interface ValueUnitGridProps {
  entries?: ValueUnitType;
}

export function ValueUnitGrid({ entries }: ValueUnitGridProps) {
  const grid = useMemo(() => {
    if (!entries) {
      return null;
    }
    return (
      <PropertyGrid
        entries={entries}
        formatEntry={({ key, entry }) => (
          <>
            {entry?.value !== undefined ? (
              <span
                className={classNames('value', {
                  'higher-value':
                    entry.previousValue !== undefined &&
                    entry.previousValue < entry.value,
                  'lower-value':
                    entry.previousValue !== undefined &&
                    entry.previousValue > entry.value,
                })}
              >
                <CopyValue
                  tooltip={
                    <React.Fragment key={Math.random()}>
                      Copy raw value to clipboard: <code>{entry.value}</code>
                    </React.Fragment>
                  }
                  value={entry.value}
                />

                {getFormattedSciNumber(entry.value)}

                {entry.previousValue ? (
                  <Tooltip
                    content={
                      <>
                        Previous value:{' '}
                        {entry.previousValue
                          ? getFormattedSciNumber(entry.previousValue)
                          : 'n/a'}
                      </>
                    }
                    key={`entry-${key}`}
                  >
                    <>
                      {entry.value < entry.previousValue ? (
                        <span
                          className="lower arrow"
                          key={`entry-value-lower-${key}-${entry.value}`}
                        >
                          ▾
                        </span>
                      ) : null}
                      {entry.value > entry.previousValue ? (
                        <span
                          className="higher arrow"
                          key={`entry-value-higher-${key}-${entry.value}`}
                        >
                          ▴
                        </span>
                      ) : null}
                    </>
                  </Tooltip>
                ) : null}
              </span>
            ) : (
              <span className="undefined">n/a</span>
            )}
            <span className="unit">{entry?.unit}</span>
          </>
        )}
      />
    );
  }, [entries]);
  return grid;
}
