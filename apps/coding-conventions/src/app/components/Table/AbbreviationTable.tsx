import { Body, Button, Flex, Table, Tooltip } from '@cognite/cogs.js';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row } from 'react-table';
import styled from 'styled-components';
import { Convention, TagDefinitions } from '../../types';

const baseColumns = [
  {
    Header: 'Abbreviation',
    accessor: 'key',
  },
  {
    Header: 'Description',
    accessor: 'description',
  },
];

const defaultColumns = (onConventionAddClick: () => void) => [
  {
    Header: ({ row }: any) => (
      <Button onClick={onConventionAddClick} icon="ListAdd" size="small" />
    ),
    id: 'extra',
  },
  ...baseColumns,
];

const dependencyColumns = (
  onDefinitionAddClick: (parentId: string) => void
) => [
  {
    Cell: ({ row }: any) => {
      return (
        <Tooltip content="Add sub-dependencies">
          <Button
            icon="Add"
            size="small"
            onClick={() => onDefinitionAddClick(row.original.id)}
          />
        </Tooltip>
      );
    },
    id: 'extra',
  },
  ...baseColumns,
];

const RenderSubTable = ({
  row,
  selectedConvention,
}: {
  row: Row<any>;
  selectedConvention: Convention;
}) => {
  const navigate = useNavigate();
  const { systemId } = useParams();

  const memoTable = useMemo(() => {
    const data = selectedConvention.definitions?.filter(
      (item) => item.dependsOn === row.original.id
    );

    return (
      <SubTableContainer>
        <Table<any>
          pagination={false}
          dataSource={data || []}
          columns={baseColumns}
        />
      </SubTableContainer>
    );
  }, [row.original.id, selectedConvention.definitions]);

  if (!selectedConvention?.dependency) {
    return null;
  }

  return <>{memoTable}</>;
};

interface Props {
  selectedConvention: Convention;
  conventions?: Convention[];
}

export const AbbreviationTable: React.FC<Props> = ({
  selectedConvention,
  conventions,
}) => {
  const { systemId } = useParams();
  const navigate = useNavigate();

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const isDependantConvention = !!selectedConvention.dependency;

  const abbreviationDefinitions = (
    (isDependantConvention
      ? conventions?.find((item) => item.id === selectedConvention.dependency)
          ?.definitions
      : selectedConvention.definitions) || []
  ).filter((item) => item.type === 'Abbreviation');

  const navigateToAddConvention = () => {
    navigate(`/conventions/${systemId}/edit/${selectedConvention.id}`);
  };

  const navigateToAddDefinitions = (parentId: string) => {
    navigate(
      `/conventions/${systemId}/edit/${selectedConvention.id}/${parentId}`
    );
  };

  useEffect(() => {
    if (!isDependantConvention) return;

    const defaultExpandedRow = abbreviationDefinitions.reduce((acc, item) => {
      return { ...acc, [item.id]: true };
    }, {});

    setExpandedRows(defaultExpandedRow);
  }, []);

  const columns = useMemo(
    () =>
      selectedConvention.dependency
        ? dependencyColumns(navigateToAddDefinitions)
        : defaultColumns(navigateToAddConvention),
    [selectedConvention.dependency]
  );

  const renderTable = useMemo(
    () => (
      <Table<TagDefinitions>
        dataSource={abbreviationDefinitions}
        columns={columns as any}
        pagination={false}
        expandedIds={expandedRows}
        onRowClick={(row) => {
          setExpandedRows((prevState) => ({
            ...prevState,
            [`${row.original.id}`]: !prevState[row.original.id],
          }));
        }}
        locale={{
          emptyText: (
            <Flex justifyContent="center" alignItems="center" gap={8}>
              <Body level="2">No definitions added</Body>
              <Button
                type="primary"
                onClick={navigateToAddConvention}
                icon="ListAdd"
              >
                Add definitions
              </Button>
            </Flex>
          ),
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
    ),
    [expandedRows]
  );

  return <>{renderTable}</>;
};

const SubTableContainer = styled.div`
  tr {
    background-color: white !important;
    &:hover {
      background-color: white !important;
    }
  }
`;
