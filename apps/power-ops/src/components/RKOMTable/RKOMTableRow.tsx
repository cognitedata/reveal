import { DefaultCommonTableRow } from 'components/CommonTable/DefaultCommonTableRow';
import { RKOMBidSequenceTableContainer } from 'components/RKOMBidSequenceTable/RKOMBidSequenceTableContainer';
import { Row } from 'react-table';

export const RKOMTableRow =
  (RKOMBidSequenceTableComponent = RKOMBidSequenceTableContainer) =>
  <T extends object>(row: Row<T>) => {
    if (row.depth === 2)
      return (
        <tr {...row.getRowProps()}>
          <td
            style={{
              padding: '0 0 0 96px',
              backgroundColor: 'var(--cogs-surface--medium)',
            }}
            colSpan={row.cells.length}
          >
            <RKOMBidSequenceTableComponent
              // @ts-expect-error very tricky to type this due to data appear only in depth 2
              externalId={row.original.sequenceExternalId}
            />
          </td>
        </tr>
      );
    return DefaultCommonTableRow(row);
  };
