import React, { useMemo, useState } from 'react';

import styled from 'styled-components';

import { Table, Typography, Widget } from '@fdx/components';
import { useFileByIdsQuery } from '@fdx/services/instances/file/queries/useFileByIdsQuery';
import { useInstanceDirectRelationshipQuery } from '@fdx/services/instances/generic/queries/useInstanceDirectRelationshipQuery';
import { EMPTY_ARRAY } from '@fdx/shared/constants/object';
import { useNavigation } from '@fdx/shared/hooks/useNavigation';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { ValueByField } from '@fdx/shared/types/filters';
import { ColumnDef } from '@tanstack/react-table';
import { matchSorter } from 'match-sorter';

import { Button, Chip, InputExp, SegmentedControl } from '@cognite/cogs.js';
import { ExternalId, FileInfo } from '@cognite/sdk/dist/src';

import { InstancePreview } from '../../../../preview/InstancePreview';
import { FDXFilePreview } from '../../../File/FilePreview';
import { RelationshipFilter } from '../../Filters';
import { RelationshipEdgesProps } from '../../RelationshipEdgesWidget';

export const FileRelationshipEdgesExpanded: React.FC<
  RelationshipEdgesProps
> = ({ type }) => {
  const { t } = useTranslation();
  const { toFilePage } = useNavigation();
  const [view, setView] = useState<'Grid' | 'List'>('Grid');
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [filterState, setFilterState] = useState<ValueByField | undefined>(
    undefined
  );

  const { data: ids, status } =
    useInstanceDirectRelationshipQuery<(ExternalId | null)[]>(type);
  const { data } = useFileByIdsQuery(ids);

  const transformedData = useMemo(() => {
    return matchSorter(data || [], inputValue || '', {
      keys: ['name', 'externalId'],
    });
  }, [data, inputValue]);

  const renderContent = () => {
    if (view === 'Grid') {
      return (transformedData || [])?.map((item) => {
        if (!item) {
          return null;
        }

        return (
          <Container>
            <Content>
              <div>
                <Typography.Title size="small">
                  {item.name || item.externalId}
                </Typography.Title>

                {/* <Typography.Body>{item.description}</Typography.Body> */}
              </div>

              <InstancePreview.File
                disabled={!item.externalId}
                id={item.externalId!}
              >
                <Button
                  type="ghost-accent"
                  icon="ArrowUpRight"
                  onClick={() => toFilePage(item.externalId)}
                >
                  {t('GENERAL_OPEN')}
                </Button>
              </InstancePreview.File>
            </Content>

            {item.externalId && (
              <FileWrapper>
                <FDXFilePreview
                  id={`file-relationship-${item.externalId}`}
                  fileId={item.externalId}
                />
              </FileWrapper>
            )}
          </Container>
        );
      });
    }

    return (
      <Table
        id="file-table"
        data={transformedData || EMPTY_ARRAY}
        columns={columns}
        onRowClick={(row) => toFilePage(row.externalId)}
      />
    );
  };

  return (
    <Widget expanded>
      <Widget.Header>
        <InputExp
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('PROPERTIES_WIDGET_SEARCH_INPUT_PLACEHOLDER')}
          icon="Search"
          clearable
        />
        <RelationshipFilter
          dataType="Files"
          value={filterState}
          onChange={setFilterState}
        />

        <SegmentedControlWrapper>
          <SegmentedControl
            currentKey={view}
            onButtonClicked={(key) => setView(key as 'Grid' | 'List')}
          >
            <SegmentedControl.Button key="Grid" icon="Grid">
              {t('WIDGET_VIEW_GRID')}
            </SegmentedControl.Button>
            <SegmentedControl.Button key="List" icon="List">
              {t('WIDGET_VIEW_LIST')}
            </SegmentedControl.Button>
          </SegmentedControl>
        </SegmentedControlWrapper>
      </Widget.Header>

      <Widget.Body
        state={transformedData?.length === 0 ? 'empty' : status}
        noPadding
      >
        {renderContent()}
      </Widget.Body>
    </Widget>
  );
};

export const columns: ColumnDef<FileInfo>[] = [
  {
    header: 'Name',
    accessorKey: 'name',
  },
  {
    header: 'Mime type',
    accessorKey: 'mimeType',
  },
  {
    header: 'Source',
    accessorKey: 'source',
  },
  {
    header: 'Directory',
    accessorKey: 'directory',
  },
  {
    header: 'Labels',
    accessorKey: 'labels',
    cell: ({ getValue }) => {
      return getValue<FileInfo[]>()?.map((item: any) => {
        return (
          <Chip size="small" key={item.externalId} label={item.externalId} />
        );
      });
    },
  },
  {
    header: 'Created time',
    accessorKey: 'sourceCreatedTime',
  },
  {
    header: 'Uploaded time',
    accessorKey: 'sourceModifiedTime',
  },
];

const SegmentedControlWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
`;

const Container = styled.div`
  border-bottom: 1px solid var(--cogs-border--interactive--default);

  &:last-child {
    border-bottom: none;
  }
`;

const Content = styled.div`
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FileWrapper = styled.div`
  height: 500px;
`;
