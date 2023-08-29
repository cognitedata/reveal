import { Dispatch, SetStateAction, useMemo } from 'react';

import styled from 'styled-components';

import { Table } from '@data-exploration/components';

import { Chip } from '@cognite/cogs.js';

import { ManualMatchInput } from '../components/ManualMatchInput';
import { useGetHiddenColumns } from '../hooks/useGetHiddenColumns';
import { useGetMatchInputOptions } from '../hooks/useGetMatchInputOptions';
import { InternalModelInstance, ManualMatch } from '../types';
import { getMatchInputInstantProperties } from '../utils/getMatchInputInstantProperties';

const MANUAL_MATCH_INPUT = 'ManualMatchInput';
const ARROW = 'arrow';

const CellContainer = styled.div`
  overflow: hidden;
`;

export const MatchTable = ({
  originInstances = [],
  matchInputInstances = [],
  manualMatches,
  setManualMatches,
}: {
  originInstances: InternalModelInstance[];
  matchInputInstances: InternalModelInstance[];
  manualMatches: {
    [key: string]: ManualMatch;
  };
  setManualMatches: Dispatch<
    SetStateAction<{
      [key: string]: ManualMatch;
    }>
  >;
}) => {
  const data = originInstances?.map(
    (originInstance: InternalModelInstance) => ({
      ...originInstance,
      [ARROW]: ARROW,
      [MANUAL_MATCH_INPUT]: MANUAL_MATCH_INPUT,
      ...getMatchInputInstantProperties(
        manualMatches[originInstance.externalId].linkedExternalId,
        matchInputInstances
      ),
    })
  );
  const matchInputOptions = useGetMatchInputOptions();

  const keysSet = new Set<string>();
  data.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      keysSet.add(key);
    });
  });
  const keys = Array.from(keysSet);

  const columns = useMemo(
    () => [
      ...keys.map((key: string) => {
        if (key === MANUAL_MATCH_INPUT) {
          return {
            id: `column-${key}`,
            header: 'Linked External Id',
            accessorKey: MANUAL_MATCH_INPUT,
            cell: (cellData: any) => (
              <ManualMatchInput
                key={`ManualMatchInput-${key}-${cellData.row.original.externalId}`}
                originExternalId={cellData.row.original.externalId}
                manualMatches={manualMatches}
                options={matchInputOptions}
                setManualMatches={setManualMatches}
              />
            ),
            size: 300,
          };
        }
        if (key === ARROW) {
          return {
            id: `column-${key}`,
            header: '',
            accessorKey: ARROW,
            cell: () => (
              <Chip
                icon="ArrowRight"
                appearance="outlined"
                style={{ border: 'none' }}
              />
            ),
            minSize: 36,
            size: 50,
          };
        }

        return {
          id: `column-${key}`,
          header: key,
          accessorKey: key,
          cell: (cellData: any) => (
            <CellContainer>{cellData.row.original[key]}</CellContainer>
          ),
          minSize: 100,
          size: 150,
        };
      }),
    ],
    [keys, manualMatches, matchInputOptions, setManualMatches]
  );

  const hiddenColumns = useGetHiddenColumns(columns, []);

  return (
    <Table<any>
      id="match-suggestion-results"
      data={data}
      columns={columns}
      hiddenColumns={hiddenColumns}
    />
  );
};
