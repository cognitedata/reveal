import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import styled from 'styled-components';

import { ViewUpdate } from '@codemirror/view';
import { useQueryClient } from '@tanstack/react-query';
import { TRANSFORMATION_ACCEPTED_SOURCE_TYPES } from '@transformations/common';
import StatusBar, {
  getSelectionRangeSummary,
  SelectionRangeSummary,
} from '@transformations/components/status-bar';
import {
  useTablesGroupedByDatabases,
  useSequences,
  useUpdateTransformation,
} from '@transformations/hooks';
import { TransformationRead } from '@transformations/types';
import {
  getQueryPreviewTabTitle,
  getSelectedCodeEditorTheme,
  getTrackEvent,
  setSelectedCodeEditorTheme,
  shouldDisableUpdatesOnTransformation,
  SQL_FORMATTER_OPTIONS,
  getSparkSQLSupport,
  SparkSQLTableSchema,
} from '@transformations/utils';
import { sparkFnHoverTooltip } from '@transformations/utils/sparkFnCompletions';
import { format } from 'sql-formatter';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { CodeEditor, CodeEditorTheme } from '@cognite/cdf-utilities';
import { Colors, Flex } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

import { useTransformationContext } from './TransformationContext';

type TransformationDetailsSQLEditorProps = {
  transformation: TransformationRead;
};

const TransformationDetailsSQLEditor = ({
  transformation,
}: TransformationDetailsSQLEditorProps) => {
  const { addTab, setActiveInspectSectionKey } = useTransformationContext();
  const { data: rawSchema } = useTablesGroupedByDatabases();
  const { data: sequences } = useSequences();
  const { mutate, reset } = useUpdateTransformation();
  const [sqlStatement, setSqlStatement] = useState(transformation.query);

  const [selectionRangeSummaries, setSelectionRangeSummaries] = useState<
    SelectionRangeSummary[]
  >([]);

  const timeoutRef = useRef<NodeJS.Timeout>();

  const sdk = useSDK();
  const queryClient = useQueryClient();

  const [theme, setTheme] = useState<CodeEditorTheme>(
    getSelectedCodeEditorTheme()
  );

  useEffect(() => {
    setSelectedCodeEditorTheme(theme);
  }, [theme]);

  const handleChange = useCallback(
    (newValue: string) => {
      setSqlStatement(newValue);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        reset();
        mutate({
          id: transformation.id,
          update: { query: { set: newValue } },
        });
      }, 500);
    },
    [mutate, reset, transformation.id]
  );

  const handleUpdate = useCallback((viewUpdate: ViewUpdate) => {
    const ranges = viewUpdate.state.selection.ranges;
    const summaries = ranges.map((range) =>
      getSelectionRangeSummary(viewUpdate.state, range)
    );
    setSelectionRangeSummaries(summaries);
  }, []);

  const formatSql = useCallback(() => {
    trackEvent(getTrackEvent('event-tr-details-query-format-click'));
    const formatted = format(sqlStatement, SQL_FORMATTER_OPTIONS);
    setSqlStatement(formatted);
  }, [sqlStatement, setSqlStatement]);

  const extensions = useMemo(() => {
    const schemas: SparkSQLTableSchema = {
      ...rawSchema,
      _cdf: TRANSFORMATION_ACCEPTED_SOURCE_TYPES, // TODO: add cdf resource schemas
      _cdf_sequences: sequences?.map((s) => s.externalId!) ?? [], // TODO: add sequence schemas
    };

    const sparkSQLSupport = getSparkSQLSupport(sdk, queryClient, schemas);

    return [sparkSQLSupport, sparkFnHoverTooltip];
  }, [rawSchema, sequences, queryClient, sdk]);

  const handleRunPreview = useCallback(() => {
    const now = new Date();
    addTab({
      key: `preview-${now.getTime()}`,
      title: getQueryPreviewTabTitle(now),
      type: 'preview',
      query: transformation.query,
      limit: 1000,
      sourceLimit: 1000,
      transformationId: transformation.id,
    });
    setActiveInspectSectionKey('preview');
  }, [
    addTab,
    setActiveInspectSectionKey,
    transformation.query,
    transformation.id,
  ]);

  return (
    <StyledContainer>
      <CodeEditor
        autoFocus={false}
        disabled={shouldDisableUpdatesOnTransformation(transformation)}
        extensions={extensions}
        onChange={handleChange}
        onUpdate={handleUpdate}
        onRun={handleRunPreview}
        theme={theme}
        value={sqlStatement}
      />
      <StatusBar
        formatSql={formatSql}
        selectionRangeSummaries={selectionRangeSummaries}
        setTheme={setTheme}
        theme={theme}
        transformation={transformation}
      />
    </StyledContainer>
  );
};

const StyledContainer = styled(Flex)`
  flex-grow: 1;
  flex-direction: column;
  height: 100%;
  border-radius: 6px;

  .cm-scroller {
    border-radius: 6px 6px 0 0;
  }

  .cm-editor {
    border-radius: 6px 6px 0 0;
  }

  .cm-tooltip.cm-completionInfo,
  .cm-tooltip-hover {
    background-color: ${Colors['surface--muted']};
    border: 1px solid ${Colors['border--muted']};
    border-radius: 6px;
    max-width: 500px;
    padding: 8px;
  }

  .spark-fn-completion-info-container {
    color: ${Colors['text-icon--strong']};
    display: flex;
    flex-direction: column;
    font-size: 12px;

    code {
      font-family: 'Source Code Pro', sans-serif;
    }

    .spark-fn-heading {
      display: flex;
      gap: 8px;
      justify-content: space-between;
      width: 100%;
    }

    .spark-fn-name {
      color: ${Colors['text-icon--strong']};
      font-size: 13px;
      font-weight: 700;
    }

    .spark-fn-type {
      background-color: ${Colors['surface--status-undefined--muted--default']};
      border-radius: 4px;
      padding: 2px 6px 1px;
      width: min-content;
      white-space: nowrap;
    }

    .spark-fn-description {
      line-height: 16px;
      margin-top: 8px;

      code {
        font-weight: 700;
      }
    }

    .spark-fn-examples {
      background-color: ${Colors['surface--misc-code--muted']};
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      margin-top: 8px;
      padding: 4px 8px;
      word-wrap: break-word;
    }
  }
`;

export default TransformationDetailsSQLEditor;
