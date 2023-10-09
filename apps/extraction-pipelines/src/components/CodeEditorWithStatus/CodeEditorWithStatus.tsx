import React, { useCallback, useState } from 'react';

import styled from 'styled-components';

import { ViewUpdate } from '@codemirror/view';
import { notification } from 'antd';
import { isEqual } from 'lodash-es';

import { CodeEditorTheme, CodeEditor } from '@cognite/cdf-utilities';
import { Colors, Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { StatusBar } from '../../pages/AddTopicFilter/StatusBar';
import {
  getSelectionRangeSummary,
  SelectionRangeSummary,
} from '../../pages/AddTopicFilter/utils';
import { getSelectedCodeEditorTheme } from '../../utils/shared';

export const CodeEditorWithStatus = ({
  autoFocus = false,
  disabled = false,
  onChange,
  onRun,
  onFormat,
  value,
  extensions,
  placeholder,
  testId,
}: {
  placeholder: string;
  autoFocus?: boolean;
  disabled?: boolean;
  onChange?: (value: string, viewUpdate: ViewUpdate) => void;
  onRun?: () => void;
  onFormat?: () => void;
  value: string;
  extensions?: any[];
  testId?: string;
}): React.JSX.Element => {
  const { t } = useTranslation();

  const [theme, setTheme] = useState<CodeEditorTheme>(
    getSelectedCodeEditorTheme()
  );
  const [editorValue, setEditorValue] = useState<string>('');

  const [selectionRangeSummaries, setSelectionRangeSummaries] = useState<
    SelectionRangeSummary[]
  >([]);

  const handleUpdate = useCallback(
    (viewUpdate: ViewUpdate) => {
      const ranges = viewUpdate.state.selection.ranges;
      const summaries = ranges.map((range) =>
        getSelectionRangeSummary(viewUpdate.state, range)
      );
      if (!isEqual(summaries, selectionRangeSummaries)) {
        setSelectionRangeSummaries(summaries);
      }
    },
    [selectionRangeSummaries]
  );

  const handleChange = useCallback(
    (val: string, viewUpdate: ViewUpdate) => {
      setEditorValue(val);
      if (onChange) {
        onChange(val, viewUpdate);
      }
    },
    [onChange]
  );

  const copyToClipboard = useCallback(async () => {
    await navigator.clipboard.writeText(editorValue);
    notification.success({ message: t('copied') });
  }, [editorValue, t]);

  return (
    <StyledContainer data-testid={testId}>
      <CodeEditor
        autoFocus={autoFocus}
        disabled={disabled}
        extensions={extensions}
        onChange={handleChange}
        onUpdate={handleUpdate}
        onRun={onRun}
        theme={theme}
        value={value}
        placeholder={placeholder}
      />
      <StatusBar
        format={onFormat}
        selectionRangeSummaries={selectionRangeSummaries}
        setTheme={setTheme}
        theme={theme}
        copyToClipBoard={copyToClipboard}
        testId={testId}
      />
    </StyledContainer>
  );
};

const StyledContainer = styled(Flex)`
  flex-grow: 1;
  flex-direction: column;
  height: 294px;
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
`;
