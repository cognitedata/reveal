import { Table } from '@cognite/cogs.js';
import { useEffect, useMemo, useState } from 'react';
import { Row } from 'react-table';
import { Convention } from '../../types';

interface Props {
  selectedConvention: Convention;
  conventions?: Convention[];
}

const defaultColumns = [
  {
    Header: 'Abbreviation',
    accessor: 'key',
  },
  {
    Header: 'Description',
    accessor: 'description',
  },
];

const dependencyColumns = [
  {
    Header: 'Dependency',
    key: 'dependency',
  },
  ...defaultColumns,
];

const RenderSubTable = ({
  row,
  selectedConvention,
}: {
  row: Row<any>;
  selectedConvention: Convention;
}) => {
  const memoTable = useMemo(() => {
    const data = selectedConvention.definitions?.filter(
      (item) => item.dependsOn === row.original.id
    );

    return (
      <Table<any>
        pagination={false}
        dataSource={data || []}
        columns={defaultColumns}
      />
    );
  }, [row.original.id, selectedConvention.definitions]);

  if (!selectedConvention?.dependency) {
    return null;
  }

  return <>{memoTable}</>;
};

export const AbbreviationTable: React.FC<Props> = ({
  selectedConvention,
  conventions,
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const isDependantConvention = !!selectedConvention.dependency;

  const abbreviationDefinitions = (
    (isDependantConvention
      ? conventions
          ?.find((item) => item.id === selectedConvention.dependency)
          ?.definitions?.filter((item) =>
            selectedConvention.definitions?.some(
              (subitem) => item.id === subitem.dependsOn
            )
          )
      : selectedConvention.definitions) || []
  ).filter((item) => item.type === 'Abbreviation');

  useEffect(() => {
    if (!isDependantConvention) return;

    const defaultExpandedRow = abbreviationDefinitions.reduce((acc, item) => {
      return { ...acc, [item.id]: true };
    }, {});

    setExpandedRows(defaultExpandedRow);
  }, []);

  const columns = useMemo(
    () => (selectedConvention.dependency ? dependencyColumns : defaultColumns),
    [selectedConvention.dependency]
  );

  return (
    <Table<any>
      dataSource={abbreviationDefinitions}
      columns={columns}
      pagination={false}
      expandedIds={expandedRows}
      onRowClick={(row) => {
        setExpandedRows((prevState) => ({
          ...prevState,
          [`${row.original.id}`]: !prevState[row.original.id],
        }));
      }}
      renderSubRowComponent={
        isDependantConvention
          ? (row) => (
              <RenderSubTable
                selectedConvention={selectedConvention}
                row={row}
              />
            )
          : undefined
      }
    />
  );
};
