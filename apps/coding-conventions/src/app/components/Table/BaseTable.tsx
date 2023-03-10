import { Body, Button, Flex, Table, Tooltip } from '@cognite/cogs.js';
import { useEffect, useMemo, useState, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row } from 'react-table';
import styled from 'styled-components';
import { ConventionItem } from '../../containers/convention/ConventionItem';
import { Convention, TagDefinitions, TagTypes } from '../../types';

interface Props {
  selectedConvention: Convention;
  conventions?: Convention[];
  baseColumns: any[];
  tagType: TagTypes;
  dependsOnId?: string;
}

const getBaseDefinitionsUpperTable = (
  isDependantConvention: boolean,
  selectedConvention: Convention,
  conventions: Convention[],
  tagType: TagTypes
) => {
  return (
    (isDependantConvention
      ? conventions?.find((item) => item.id === selectedConvention.dependency)
          ?.definitions
      : selectedConvention.definitions
    )?.filter((item) => item.type === tagType) || []
  );
};

const getBaseDefinitionsSubTable = (
  selectedConvention: Convention,
  tagType: TagTypes,
  dependsOnId: string
) => {
  const definitions = selectedConvention.definitions?.filter(
    (item) => item.dependsOn === dependsOnId && item.type === tagType
  );
  return definitions || [];
};

export const BaseTable: React.FC<Props> = memo(
  ({ selectedConvention, conventions, baseColumns, tagType, dependsOnId }) => {
    const { systemId } = useParams();
    const navigate = useNavigate();

    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>(
      {}
    );
    const isDependantConvention =
      !!selectedConvention.dependency && !dependsOnId;

    const baseDefinitions = !dependsOnId
      ? getBaseDefinitionsUpperTable(
          isDependantConvention,
          selectedConvention,
          conventions || [],
          tagType
        )
      : getBaseDefinitionsSubTable(
          selectedConvention,
          tagType,
          dependsOnId || ''
        );

    const defaultColumns = (editMap: {
      conventionEditButton: () => string;
      tagDefinitionEditButton: (row: Row<TagDefinitions>) => string;
    }) => {
      const editButton =
        tagType === 'Abbreviation'
          ? []
          : [
              {
                Cell: ({ row }: any) => {
                  return (
                    <Tooltip content="Edit Definition">
                      <Button
                        icon="Edit"
                        size="small"
                        onClick={() =>
                          navigate(editMap['tagDefinitionEditButton'](row))
                        }
                      />
                    </Tooltip>
                  );
                },
                id: 'editElem',
              },
            ];

      return [
        {
          Header: () => (
            <Tooltip content="Add Definition">
              <Button
                onClick={() => navigate(editMap['conventionEditButton']())}
                icon="ListAdd"
                size="small"
              />
            </Tooltip>
          ),
          id: 'extra',
        },
        ...baseColumns,
        ...editButton,
      ];
    };

    const dependencyColumns = () => [...baseColumns];

    useEffect(() => {
      if (!isDependantConvention) return;

      const defaultExpandedRow = baseDefinitions.reduce((acc, item) => {
        return { ...acc, [item.id]: false };
      }, {});

      setExpandedRows(defaultExpandedRow);
    }, []);

    const editMap = {
      conventionEditButton: () => {
        if (tagType === 'Abbreviation')
          return dependsOnId
            ? `/conventions/${systemId}/edit/${selectedConvention.id}/${dependsOnId}`
            : `/conventions/${systemId}/edit/${selectedConvention.id}`;
        else
          return dependsOnId
            ? `/definition/edit/${systemId}/${selectedConvention.id}/${dependsOnId}/new/${tagType}`
            : `/definition/edit/${systemId}/${selectedConvention.id}/new/${tagType}`;
      },
      tagDefinitionEditButton: (row: Row<TagDefinitions>) =>
        dependsOnId
          ? `/definition/edit/${systemId}/${selectedConvention.id}/${dependsOnId}/${row.original.id}/${tagType}`
          : `/definition/edit/${systemId}/${selectedConvention.id}/${row.original.id}/${tagType}`,
    };

    const columns = useMemo(
      () =>
        isDependantConvention ? dependencyColumns() : defaultColumns(editMap),
      [isDependantConvention]
    );

    const renderTable = useMemo(
      () => (
        <StyledPagination>
          <Table<TagDefinitions>
            dataSource={baseDefinitions}
            columns={columns as any}
            pagination={true}
            expandedIds={expandedRows}
            onRowClick={(row) => {
              setExpandedRows((prevState) => ({
                ...prevState,
                [`${row.original.id}`]: !prevState[row.original.id],
              }));
            }}
            locale={{
              emptyText: !isDependantConvention ? (
                <Flex justifyContent="center" alignItems="center" gap={8}>
                  <Body level="2">No definitions added</Body>
                  <Button
                    type="primary"
                    onClick={() => navigate(editMap['conventionEditButton']())}
                    icon="ListAdd"
                  >
                    Add definitions
                  </Button>
                </Flex>
              ) : undefined,
            }}
            renderSubRowComponent={
              isDependantConvention
                ? (row) => (
                    <SubTableContainer>
                      <ConventionItem
                        conventions={conventions}
                        selectedConvention={selectedConvention}
                        dependsOnId={row.original.id}
                      />
                    </SubTableContainer>
                  )
                : undefined
            }
          />
        </StyledPagination>
      ),
      [expandedRows, conventions, selectedConvention]
    );

    return <>{renderTable}</>;
  }
);

const SubTableContainer = styled.div`
  tr {
    background-color: white !important;
    &:hover {
      background-color: white !important;
    }
  }
`;

const StyledPagination = styled.div`
  .cogs-table-pagination {
    display: none;
  }
`;
