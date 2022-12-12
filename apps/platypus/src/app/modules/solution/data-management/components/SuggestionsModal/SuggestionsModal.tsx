import { CogDataGrid } from '@cognite/cog-data-grid';
import {
  Body,
  Button,
  Flex,
  Icon,
  Select,
  Slider,
  Title,
} from '@cognite/cogs.js';
import * as Sentry from '@sentry/react';
import { SplitPanelLayout } from '@platypus-app/components/Layouts/SplitPanelLayout';
import { ModalDialog } from '@platypus-app/components/ModalDialog/ModalDialog';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { KeyValueMap } from '@platypus/platypus-core';
import { GetRowIdParams } from 'ag-grid-community';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useSuggestions } from './useSuggestions';
import { DataPreviewTableProps } from '../DataPreviewTable/DataPreviewTable';
import { TypeColumnSelect } from './TypeColumnSelect';
import { useSuggestionsGridConfig } from './useSuggestionsGridConfig';
import { useSuggestionsResult } from './useSuggestionsResult';

export type SuggestionsTableData = {
  id: string;
  source: { externalId: string } & KeyValueMap;
  target: { externalId: string } & KeyValueMap;
  score: number;
  relativeScore: number;
  isSelected?: boolean;
  isApproved?: boolean;
};

const INITIAL_CONFIDENCE_SCORE = 0.8;
const INITIAL_SELECTED_COLUMN = ['externalId'];

type SuggestionsModalProps = {
  onCancel: (column?: string) => void;
  onConfirm: (column: string, data: KeyValueMap[], rejected: string[]) => void;
  dataModelInfo: DataPreviewTableProps;
  defaultColumn?: string;
};

export const SuggestionsModal = ({
  onCancel,
  onConfirm,
  dataModelInfo,
  defaultColumn,
}: SuggestionsModalProps) => {
  const { t } = useTranslation('Suggestions');

  const {
    dataModelType,
    dataModelTypeDefs,
    dataModelExternalId,
    version,
    space,
  } = dataModelInfo;
  const { acceptMatches, rejectMatches, getRejectedMatches } = useSuggestions({
    dataModelType,
    dataModelTypeDefs,
    dataModelExternalId,
    version,
    space,
  });

  const rejectedMatches = getRejectedMatches();

  const propertiesForMatching = dataModelType.fields.filter(
    (el) => !el.type.list && el.type.custom
  );

  const getInitialColumn = () => {
    if (propertiesForMatching.length === 0) {
      return undefined;
    }
    const column =
      (defaultColumn &&
        propertiesForMatching.find((el) => el.name === defaultColumn)) ||
      propertiesForMatching[0];
    return {
      name: column.name,
      type: column.type.name,
    };
  };

  // chosen target column
  const [selectedColumn, setSelectedColumn] = useState<
    { name: string; type: string } | undefined
  >(getInitialColumn());

  const targetTypeDef = selectedColumn
    ? dataModelTypeDefs.types.find(
        (typeDef) => typeDef.name === selectedColumn?.type
      )
    : undefined;

  // chosen matching columns
  const [selectedSourceColumns, setSelectedSourceColumns] = useState(
    INITIAL_SELECTED_COLUMN
  );
  const [selectedTargetColumns, setSelectedTargetColumns] = useState(
    INITIAL_SELECTED_COLUMN
  );

  const [confidence, setConfidence] = useState(INITIAL_CONFIDENCE_SCORE);

  const { isLoading, suggestionsResult } = useSuggestionsResult({
    matchConfidence: confidence,
    dataModelInfo,
    selectedSourceColumns,
    selectedTargetColumns,
    targetTypeDef,
    selectedColumn: selectedColumn?.name,
  });

  const [selectedRows, setSelectedRows] = useState<{
    [key in string]: boolean;
  }>({});

  const isAllSelected =
    suggestionsResult.length !== 0 &&
    suggestionsResult.length === Object.keys(selectedRows).length;

  const [approvedMatches, setApprovedMatch] = useState<{
    [key in string]: boolean;
  }>({});

  const resetState = () => {
    setSelectedSourceColumns(INITIAL_SELECTED_COLUMN);
    setSelectedTargetColumns(INITIAL_SELECTED_COLUMN);
    setConfidence(INITIAL_CONFIDENCE_SCORE);
  };

  const tableData: SuggestionsTableData[] = useMemo(() => {
    return suggestionsResult
      .filter((el) => !rejectedMatches.includes(el.id))
      .map((el) => ({
        ...el,
        isApproved: approvedMatches[el.id],
        isSelected: !!selectedRows[el.id],
      }));
  }, [suggestionsResult, approvedMatches, selectedRows, rejectedMatches]);

  const gridService = useSuggestionsGridConfig();

  const gridConfig = useMemo(
    () =>
      gridService.getGridConfig({
        onSelect: (id) =>
          setSelectedRows((currState) =>
            toggleKeyInObject(currState, id, true)
          ),
        onApprove: (id) =>
          setApprovedMatch((currState) =>
            toggleKeyInObject(currState, id, true)
          ),
        onReject: (id) =>
          setApprovedMatch((currState) =>
            toggleKeyInObject(currState, id, false)
          ),
        onSelectAll: (allSelected) => {
          if (allSelected) {
            setSelectedRows(
              tableData.reduce(
                (prev, item) => ({ ...prev, [item.id]: true }),
                {} as { [key in string]: boolean }
              )
            );
          } else {
            setSelectedRows({});
          }
        },
        selectedSourceColumns,
        selectedTargetColumns,
        sourceName: dataModelType.name,
        targetName: targetTypeDef?.name || '',
        isAllSelected,
      }),
    // Regenerate colDefs this only and only when this are changed
    // Otherwise, if colDefs are changed, the whole grid will re-render
    [
      selectedSourceColumns,
      selectedTargetColumns,
      dataModelType.name,
      targetTypeDef,
      gridService,
      isAllSelected,
      tableData,
    ]
  );

  const onApproved = async () => {
    if (selectedColumn) {
      const confirmedMatches = tableData
        .filter((el) => el.isApproved)
        .map((el) => ({
          ...el.source,
          [selectedColumn.name]: { externalId: el.target.externalId },
        }));

      const newRejectedMatches = tableData
        .filter((el) => el.isApproved === false)
        .map((el) => el.id);
      try {
        await rejectMatches([...rejectedMatches, ...newRejectedMatches]);
        if (confirmedMatches.length > 0) {
          await acceptMatches(confirmedMatches);
          Notification({
            type: 'success',
            message: t('suggestions_success', 'Approved suggestions are saved'),
          });
        }
        onConfirm(selectedColumn.name, confirmedMatches, newRejectedMatches);
      } catch (e) {
        Sentry.captureException(e);
        Notification({
          type: 'error',
          message: t('suggestions_failed', 'Unable to save suggestions'),
        });
      }
    }
  };

  return (
    <ModalDialog
      visible={true}
      title="Suggestions"
      onCancel={() => onCancel(selectedColumn?.name)}
      onOk={onApproved}
      width={'98vw'}
      height={'84vh'}
      okButtonName="Confirm"
      okType="primary"
    >
      <Wrapper>
        <SplitPanelLayout
          sidebar={
            <Flex gap={26} style={{ marginRight: 26 }} direction="column">
              <Flex style={{ height: 30 }} alignItems="center">
                <Title level={5}>
                  {t('define_suggestions', 'Define your suggestions')}
                </Title>
              </Flex>
              <Select
                label={t(
                  'define_suggestions_subtitle',
                  'Show suggestion for column:'
                )}
                inputId="suggestion-target"
                data-cy="suggestion-target"
                data-testid="suggestion-target"
                options={propertiesForMatching.map((el) => ({
                  label: el.name,
                  value: { name: el.name, type: el.type.name },
                }))}
                value={
                  selectedColumn
                    ? { value: selectedColumn, label: selectedColumn.name }
                    : undefined
                }
                onChange={({
                  value,
                }: {
                  value?: { name: string; type: string };
                }) => {
                  resetState();
                  setApprovedMatch({});
                  setSelectedRows({});
                  setSelectedColumn(value);
                }}
              />
              {targetTypeDef && (
                <>
                  <div>
                    <Body level={2} strong style={{ marginBottom: 6 }}>
                      {t(
                        'define_suggestions_column_select',
                        'Suggestion based on '
                      )}
                      <span style={{ color: 'var(--cogs-text-icon--muted)' }}>
                        {t(
                          'define_suggestions_column_select_default',
                          '(default)'
                        )}
                      </span>
                      :
                    </Body>
                    <Flex direction="row" gap={20} alignItems="center">
                      <div style={{ flex: 1, position: 'relative', width: 0 }}>
                        <TypeColumnSelect
                          type={dataModelType}
                          selected={selectedSourceColumns}
                          onChange={setSelectedSourceColumns}
                        />
                      </div>
                      <div>
                        <Icon type="ArrowRight" />
                      </div>
                      <div style={{ flex: 1, position: 'relative', width: 0 }}>
                        <TypeColumnSelect
                          type={targetTypeDef}
                          selected={selectedTargetColumns}
                          onChange={setSelectedTargetColumns}
                        />
                      </div>
                    </Flex>
                  </div>
                  <div>
                    <Body level={2} strong>
                      {t(
                        'define_suggestions_column_slider',
                        'Number of suggestions:'
                      )}
                    </Body>
                    <Slider
                      value={confidence}
                      min={0}
                      max={1}
                      step={0.01}
                      marks={{
                        0: {
                          label: 'Higher quality',
                          style: { left: 0, transform: 'none' },
                        },
                        1: {
                          label: 'Lower quality',
                          style: {
                            right: 0,
                            transform: 'none',
                            left: 'initial',
                          },
                        },
                      }}
                      onChange={setConfidence}
                    />
                  </div>
                  <Flex style={{ marginTop: 26 }}>
                    <Button icon="Refresh" onClick={() => resetState()}>
                      {t(
                        'define_suggestions_reset',
                        'Return to default settings'
                      )}
                    </Button>
                  </Flex>
                </>
              )}
            </Flex>
          }
          sidebarWidth={'40%'}
          sidebarMinWidth={320}
          content={
            tableData && targetTypeDef && tableData && tableData.length > 0 ? (
              <Flex
                style={{ marginBottom: 12, marginLeft: 26, height: '100%' }}
                direction="column"
              >
                <Flex gap={6} style={{ marginBottom: 10 }} alignItems="center">
                  <Title level={5}>
                    {t('suggestions_found', 'Suggestions found')}(
                    {tableData.length})
                  </Title>
                  <div style={{ flex: 1 }} />
                  <Button
                    icon="Checkmark"
                    data-testid="accept-selection"
                    onClick={() => {
                      setApprovedMatch((currState) => ({
                        ...currState,
                        ...Object.keys(selectedRows).reduce((prev, key) => {
                          return { ...prev, [key]: true };
                        }, {} as { [key in string]: boolean }),
                      }));
                      setSelectedRows({});
                    }}
                  >
                    {t('suggestions_accept_selected', 'Accept Selected')}
                  </Button>
                  <Button
                    icon="Close"
                    data-testid="reject-selection"
                    onClick={() => {
                      setApprovedMatch((currState) => ({
                        ...currState,
                        ...Object.keys(selectedRows).reduce((prev, key) => {
                          return { ...prev, [key]: false };
                        }, {} as { [key in string]: boolean }),
                      }));
                      setSelectedRows({});
                    }}
                  >
                    {t('suggestions_reject_selected', 'Reject Selected')}
                  </Button>
                </Flex>
                <div style={{ flex: 1, overflow: 'auto' }}>
                  <CogDataGrid
                    pagination={false}
                    defaultColDef={{
                      headerComponent: ({
                        displayName,
                      }: {
                        displayName: React.ReactNode;
                      }) => displayName,
                    }}
                    gridOptions={{
                      enableCellTextSelection: true,
                      getRowId: (params: GetRowIdParams) => {
                        const key = params.data.id;
                        return key || 'undefined';
                      },
                    }}
                    wrapperStyle={{ height: '100%' }}
                    theme="suggestions"
                    config={gridConfig}
                    data={tableData}
                  />
                </div>
              </Flex>
            ) : (
              <Flex
                style={{ height: '100%', width: '100%' }}
                alignItems="center"
                justifyContent="center"
              >
                <Flex direction="column" alignItems="center">
                  {isLoading ? (
                    <Icon type="Loader" />
                  ) : (
                    <>
                      <Title level={5}>
                        {t('suggestions_not_found', 'No suggestions found.')}
                      </Title>
                      <Body
                        level={2}
                        style={{
                          marginTop: 8,
                          maxWidth: 570,
                          textAlign: 'center',
                        }}
                      >
                        {selectedColumn
                          ? t(
                              'suggestions_pattern_no_result',
                              `No pattern is identified to generate suggestions for column '${selectedColumn.name}'. Try to add more data to allow a pattern to be recognised and more suggestions to be generated.`
                            )
                          : t(
                              'suggestions_pattern_no_column_chosen',
                              'Please select a column.'
                            )}
                      </Body>
                    </>
                  )}
                </Flex>
              </Flex>
            )
          }
        />
      </Wrapper>
    </ModalDialog>
  );
};

export const toggleKeyInObject = <T,>(
  input: {
    [key in string]: T;
  },
  id: string,
  value: T
) => {
  const newValue = { ...input };
  // if the existing key value is already, unset it
  if (input[id] === value) {
    delete newValue[id];
  } else {
    newValue[id] = value;
  }
  return newValue;
};

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
