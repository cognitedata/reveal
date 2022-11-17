import { Button, Skeleton } from '@cognite/cogs.js';
import { RKOMBidSequenceTable } from 'components/RKOMBidSequenceTable/RKOMBidSequenceTable';
import { StyledSequenceTable } from 'components/RKOMTable/elements';
import { useFetchRKOMBidSequence } from 'queries/useFetchRKOMBidSequence';
import { useFetchSequenceRows } from 'queries/useFetchSequenceRows';

type Props = {
  externalId: string;
};

export const LoadingRKOMBidSequenceTable = () => (
  <StyledSequenceTable>
    <tbody>
      <tr key="price">
        <th>
          Price <br />
          <Skeleton.Rectangle width="50px" />
        </th>
        {[...Array(10).keys()].map((a) => (
          <td key={a}>
            <Skeleton.Rectangle width="20px" />
          </td>
        ))}
      </tr>
      <tr key="volume">
        <th>
          Volume <br />
          <Skeleton.Rectangle width="50px" />
        </th>
        {[...Array(10).keys()].map((a) => (
          <td key={a}>
            <Skeleton.Rectangle width="20px" />
          </td>
        ))}
      </tr>
    </tbody>
  </StyledSequenceTable>
);

export const RKOMBidSequenceTableContainer = ({ externalId }: Props) => {
  const {
    data: sequence,
    status: sequenceStatus,
    refetch: sequenceRefetch,
  } = useFetchRKOMBidSequence(externalId);

  const {
    data: sequenceRows,
    status: sequenceRowsStatus,
    refetch: sequenceRowsRefetch,
  } = useFetchSequenceRows(externalId);

  const onReloadClick = () => {
    sequenceRowsRefetch();
    sequenceRefetch();
  };

  if (sequenceStatus === 'loading' || sequenceRowsStatus === 'loading')
    return <LoadingRKOMBidSequenceTable />;

  if (sequenceStatus === 'error' || sequenceRowsStatus === 'error')
    return (
      <>
        Error loading data <Button onClick={onReloadClick}>Reload data</Button>
      </>
    );

  return (
    <RKOMBidSequenceTable
      priceUnit={sequence.metadata['bid:unit_price'] ?? ''}
      prices={sequenceRows.map((row) => Number(row.values[1])) ?? []}
      volumes={sequenceRows.map((row) => Number(row.values[0])) ?? []}
      volumeUnit={sequence.metadata['bid:unit_volume'] ?? ''}
    />
  );
};
