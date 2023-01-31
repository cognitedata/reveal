import { Table } from '@cognite/cogs.js';
import { useEffect, useMemo, useState } from 'react';
import { Row } from 'react-table';
import { Convention } from '../../types';

interface Props {
  convention: Convention;
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
    key: 'dependsOn',
  },
  ...defaultColumns,
];

const RenderSubTable = ({
  row,
  convention,
  conventions,
}: {
  row: Row<any>;
  conventions?: Convention[];
  convention: Convention;
}) => {
  const memoTable = useMemo(() => {
    const data = convention.definitions?.filter(
      (item) => item.dependsOn === row.original.id
    );

    return (
      <Table<any>
        pagination={false}
        dataSource={data || []}
        columns={defaultColumns}
      />
    );
  }, [row.original.id, convention.definitions]);

  if (!convention?.dependency) {
    return null;
  }

  return <>{memoTable}</>;
};

export const AbbreviationTable: React.FC<Props> = ({
  convention,
  conventions,
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const isDependantConvention = !!convention.dependency;

  const abbreviationDefinitions = (
    (isDependantConvention
      ? conventions
          ?.find((item) => item.id === convention.dependency)
          ?.definitions?.filter((item) =>
            convention.definitions?.some(
              (subitem) => item.id === subitem.dependsOn
            )
          )
      : convention.definitions) || []
  ).filter((item) => item.type === 'Abbreviation');

  useEffect(() => {
    if (!isDependantConvention) return;

    const defaultExpandedRow = abbreviationDefinitions.reduce((acc, item) => {
      return { ...acc, [item.id]: true };
    }, {});

    setExpandedRows(defaultExpandedRow);
  }, []);

  const columns = useMemo(
    () => (convention.dependency ? dependencyColumns : defaultColumns),
    [convention.dependency]
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
                convention={convention}
                conventions={conventions}
                row={row}
              />
            )
          : undefined
      }
    />
  );
};
