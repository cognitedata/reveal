import { GridConfig } from '@cognite/cog-data-grid';
import { Body, Button, Checkbox, Flex, Icon } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { ICellRendererParams } from 'ag-grid-community';
import { useCallback } from 'react';
import styled, { css } from 'styled-components';
import { SuggestionsTableData } from './SuggestionsModal';

export interface getGridConfigProps {
  sourceName: string;
  targetName: string;
  selectedSourceColumns: string[];
  selectedTargetColumns: string[];
  onSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onSelectAll: (isAllSelected: boolean) => void;
  isAllSelected: boolean;
}

const CELL_STYLE = {
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
};

export const useSuggestionsGridConfig = () => {
  const { t } = useTranslation('SuggestionsTable');

  const getGridConfig = useCallback(
    ({
      sourceName,
      targetName,
      selectedSourceColumns,
      selectedTargetColumns,
      onSelect,
      onApprove,
      onReject,
      onSelectAll,
      isAllSelected,
    }: getGridConfigProps): GridConfig => {
      const tableConfig = {
        columns: [
          {
            property: 'source',
            label: (
              <Flex gap={6}>
                <Checkbox
                  name="select-all"
                  data-testid="select-all"
                  checked={isAllSelected}
                  onChange={(value) => onSelectAll(value)}
                />
                <Body
                  level={2}
                  style={{ textOverflow: 'ellipsis', overflow: 'hidden' }}
                >
                  <span
                    style={{
                      color: 'var(--cogs-text-icon--muted)',
                    }}
                  >
                    {sourceName}:{' '}
                  </span>
                  {selectedSourceColumns.map((el) => el).join(', ')}
                </Body>
              </Flex>
            ),
            optional: false,
            dataType: 'N/A',
            defaultValue: '',
            execOrder: 1,
            metadata: {},
            rules: [],
            displayOrder: 1,
            colDef: {
              width: 261,
              editable: false,
              sortable: false,
              suppressMovable: true,
              cellStyle: CELL_STYLE,
              cellRenderer: (
                row: ICellRendererParams<SuggestionsTableData>
              ) => (
                <Flex gap={6}>
                  <Checkbox
                    name="select"
                    data-testid="select"
                    checked={row.data?.isSelected}
                    onChange={() => onSelect(row.data!.id)}
                  />
                  <Body
                    level={2}
                    style={{
                      flex: 1,
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {selectedSourceColumns
                      .map((el) => row.data!.source[el])
                      .join(', ')}
                  </Body>
                </Flex>
              ),
            },
          },
          {
            property: 'actions',
            label: '',
            defaultValue: '',
            optional: false,
            dataType: 'N/A',
            colDef: {
              width: 36,
              editable: false,
              resizable: false,
              sortable: false,
              suppressMovable: true,
              suppressSizeToFit: true,
              cellStyle: CELL_STYLE,
              cellRenderer: () => <Icon type="ArrowRight" />,
            },
          },
          {
            property: 'destination',
            label: (
              <Body level={2}>
                <span
                  style={{
                    color: 'var(--cogs-text-icon--muted)',
                  }}
                >
                  {targetName}:{' '}
                </span>
                {selectedTargetColumns.map((el) => el).join(', ')}
              </Body>
            ),
            optional: false,
            dataType: 'N/A',
            defaultValue: '',
            execOrder: 1,
            metadata: {},
            rules: [],
            displayOrder: 1,
            colDef: {
              width: 261,
              editable: false,
              sortable: false,
              suppressMovable: true,
              cellStyle: CELL_STYLE,
              cellRenderer: (row: ICellRendererParams) => (
                <Body
                  level={2}
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {selectedTargetColumns
                    .map((el) => row.data.target[el])
                    .join(', ')}
                </Body>
              ),
            },
          },
          {
            property: 'actions',
            label: '',
            defaultValue: '',
            optional: false,
            dataType: 'N/A',
            colDef: {
              flex: 1,
              editable: false,
              resizable: false,
              sortable: false,
              suppressMovable: true,
              suppressSizeToFit: true,
              cellStyle: { ...CELL_STYLE, justifyContent: 'end' },
              cellRenderer: (
                row: ICellRendererParams<SuggestionsTableData>
              ) => (
                <Flex gap={6}>
                  <AcceptButton
                    icon="Checkmark"
                    aria-label="accept"
                    data-testid="accept"
                    size="small"
                    $selected={!!row.data?.isApproved}
                    type={row.data?.isApproved ? 'primary' : 'tertiary'}
                    onClick={() => onApprove(row.data!.id)}
                  />
                  <RejectButton
                    icon="Close"
                    aria-label="reject"
                    data-testid="reject"
                    size="small"
                    $selected={row.data?.isApproved === false}
                    type={
                      row.data?.isApproved === false ? 'primary' : 'tertiary'
                    }
                    onClick={() => onReject(row.data!.id)}
                  />
                </Flex>
              ),
            },
          },
        ],
        customFunctions: [],
        dataSources: [],
      } as GridConfig;

      return tableConfig;
    },
    []
  );

  return {
    getGridConfig,
  };
};

const AcceptButton = styled(Button)<{ $selected: boolean }>(
  (props) =>
    props.$selected &&
    css`
      && {
        border: 1px solid transparent;
        color: var(--cogs-text-icon--status-success);
        background: var(--cogs-surface--status-success--muted--default);
      }

      &&:hover {
        color: var(--cogs-text-icon--status-success);
        background: var(--cogs-surface--status-success--muted--hover);
      }
    `
);
const RejectButton = styled(Button)<{ $selected: boolean }>(
  (props) =>
    props.$selected &&
    css`
      && {
        border: 1px solid transparent;
        color: var(--cogs-text-icon--status-critical);
        background: var(--cogs-surface--status-critical--muted--default);
      }

      &&:hover {
        color: var(--cogs-text-icon--status-critical);
        background: var(--cogs-surface--status-critical--muted--hover);
      }
    `
);
