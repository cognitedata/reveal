import React from 'react';
import { Sequence, SequenceColumn } from '@cognite/sdk';
import { DetailsItem } from 'components';

const formatSequenceColumns = (columns: SequenceColumn[]) =>
  columns.reduce(
    (agg, cur) =>
      agg.concat([
        {
          column: cur.name || cur.externalId || `${cur.id}`,
          value: `${cur.valueType}${
            cur.description ? ` - ${cur.description}` : ''
          }`,
        },
      ]),
    [] as { column: string; value: string }[]
  );

export const SequenceColumns = ({ sequence }: { sequence: Sequence }) => {
  return (
    <>
      {formatSequenceColumns((sequence && sequence.columns) ?? {}).map(el => (
        <DetailsItem key={el.column} name={el.column} value={el.value} />
      ))}
    </>
  );
};
