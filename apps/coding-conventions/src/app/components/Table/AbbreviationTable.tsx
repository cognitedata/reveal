import { Table } from '@cognite/cogs.js';
import { useState } from 'react';
import { Convention } from '../../pages/conventions/types';

interface Props {
  convention: Convention;
  conventions?: Convention[];
}

export const AbbreviationTable: React.FC<Props> = ({
  convention,
  conventions,
}) => {
  const [rows, setRows] = useState<Record<string, boolean>>({});
  console.log('🚀 ~ file: AbbreviationTable.tsx:11 ~ rows', rows);
  const abbreviationDefinitions = (convention.definitions || []).filter(
    (item) => item.type === 'Abbreviation'
  );

  return (
    <Table<any>
      dataSource={abbreviationDefinitions}
      columns={[
        {
          Header: 'Abbreviation',
          accessor: 'key',
        },
        {
          Header: 'Description',
          accessor: 'description',
        },
      ]}
      pagination={false}
      expandedIds={rows}
      onRowClick={(row) => {
        console.log('row', row);
        setRows((prevState) => ({
          ...prevState,
          [`${row.original.id}`]: !prevState[row.original.id],
        }));
      }}
      renderSubRowComponent={
        convention.dependency
          ? () => {
              const dependentConvention = conventions?.find(
                (item) => item.id === convention.dependency
              );
              return <p>hi: {dependentConvention?.name}</p>;
            }
          : undefined
      }
      // onRow={() => ({
      //   onClick: action('onClick'),
      // })}
    />
  );
};
