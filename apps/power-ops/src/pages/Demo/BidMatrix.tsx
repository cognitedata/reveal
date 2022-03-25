import { Table, Label } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { useEffect, useState } from 'react';
import { SequenceItem } from '@cognite/sdk';

import { SequenceRow, TableData } from '../../models/sequences';

import { StyledBidMatrix, StyledDiv, Frame, StyledHeader } from './elements';

interface Cols {
  Header: string | undefined;
  accessor: string | undefined;
  disableSortBy: boolean;
}

const BidMatrix = (props: { eventId: string }) => {
  const { eventId } = props;
  const { client } = useAuthContext();

  const [sequenceCols, setSequenceCols] = useState<Cols[] | undefined>();

  const [sequenceData, setSequenceData] = useState<TableData[]>();

  useEffect(() => {
    getBidMatrix(eventId);
  }, [eventId]);

  const getBidMatrix = async (eventId: any) => {
    const matrixExternalId = await getBidMatrixExternalId(eventId);
    // Get bid matrix
    const sequenceRows = await client?.sequences
      .retrieveRows({
        externalId: matrixExternalId || '',
      })
      .autoPagingToArray({ limit: 100 });

    if (!sequenceRows?.length) return;

    // Create array of table columns
    let columnHeaders: Cols[] = sequenceRows.map((row: SequenceRow) => {
      const accessor = row[0]?.toString().replace('.', '');
      return {
        Header: `${row[0]}`,
        accessor,
        disableSortBy: true,
      } as Cols;
    });
    columnHeaders = [
      {
        Header: sequenceRows[0]?.columns[0]?.name,
        accessor: sequenceRows[0]?.columns[0]?.externalId,
        disableSortBy: true,
      },
      ...columnHeaders,
    ];

    // CDF Sequences have a particular format that needs to be transposed and massaged
    let transposedColumns = sequenceRows.map((row: SequenceRow) => {
      const accessor = row[0]?.toString().replace('.', '');
      return { accessor, values: row.slice(1) };
    });
    transposedColumns = [
      {
        accessor: 'price',
        values: sequenceRows[0]?.columns
          .slice(1)
          .map((col) => col.name as SequenceItem),
      },
      ...transposedColumns,
    ];

    // Create array of table data
    const tableData: TableData[] = [];
    transposedColumns?.forEach((col) => {
      col?.values.forEach((value, index) => {
        if (!tableData[index]) {
          tableData[index] = {
            id: index,
          };
        }
        const accessor = `${col?.accessor || 0}`;
        const formattedValue =
          typeof value === 'number' ? `${Math.round(value * 10) / 10}` : value;
        tableData[index][accessor] = formattedValue || 0;
      });
    });
    setSequenceCols(columnHeaders);
    setSequenceData(tableData);
  };

  const getBidMatrixExternalId = async (
    eventId: string
  ): Promise<string | undefined> => {
    const relationships = await client?.relationships.list({
      filter: {
        targetExternalIds: [eventId || ''],
      },
    });
    const matrixRelationships = await client?.relationships.list({
      filter: {
        sourceExternalIds: [relationships?.items[0].sourceExternalId || ''],
        targetTypes: ['sequence'],
      },
    });
    return matrixRelationships?.items[0].targetExternalId;
  };

  return (
    <Frame>
      <StyledDiv>
        <StyledHeader>
          <Label
            icon="ArrowLeft"
            iconPlacement="left"
            onClick={() => {
              // setBidMatrixVisible(false)
            }}
          >
            Back
          </Label>
          <h1>Bid Matrix</h1>
        </StyledHeader>
        <StyledBidMatrix>
          <Table
            pagination={false}
            columns={sequenceCols as any}
            dataSource={sequenceData as TableData[]}
          />
        </StyledBidMatrix>
      </StyledDiv>
    </Frame>
  );
};

export default BidMatrix;
