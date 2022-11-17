import { useMemo } from 'react';
import { CommonTable } from 'components/CommonTable';
import { RKOMTableRow } from 'components/RKOMTable/RKOMTableRow';
import { RKOMTableColumns } from 'pages/RKOM/utils';
import { RKOMTableData } from 'types';

type Props = {
  onSelectBid: (bids: Record<string, string>) => void;
  data: RKOMTableData;
  bidSequenceTableComponent?: Parameters<typeof RKOMTableRow>[0];
};

export const RKOMTable = ({
  data,
  onSelectBid,
  bidSequenceTableComponent,
}: Props) => {
  // All first level rows (watercourses) and their first bid will be expanded initially
  const initialExpanded = useMemo<Record<string, boolean>>(() => {
    return data.reduce(
      (acc, _row, index) => ({ ...acc, [index]: true, [`${index}.0`]: true }),
      {} as Record<string, boolean>
    );
  }, data);

  return (
    <form
      className="main"
      onChange={(e) =>
        onSelectBid(
          // @ts-expect-error this is correct but typing is tricky
          Object.fromEntries(new FormData(e.target.form).entries())
        )
      }
    >
      <CommonTable
        columns={RKOMTableColumns}
        data={data}
        showPagination={false}
        initialExpanded={initialExpanded}
        rowComponent={RKOMTableRow(bidSequenceTableComponent)}
        pageSize={1000}
      />
    </form>
  );
};
