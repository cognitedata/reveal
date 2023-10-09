import React, { Dispatch, SetStateAction, useMemo } from 'react';
import { Trans } from 'react-i18next';

import styled from 'styled-components';

import { EditorState, SelectionRange } from '@codemirror/state';

import { CodeEditorTheme } from '@cognite/cdf-utilities';
import {
  Body,
  Button,
  Colors,
  Dropdown,
  Flex,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';

import { useTranslation } from '../../common';

type StatusBarProps = {
  format?: () => void;
  selectionRangeSummaries: SelectionRangeSummary[];
  setTheme: Dispatch<SetStateAction<CodeEditorTheme>>;
  theme: CodeEditorTheme;
  copyToClipBoard: () => void;
  testId?: string;
};

type BoundarySummary = {
  line: number;
  column: number;
};

export type SelectionRangeSummary = {
  from: BoundarySummary;
  to: BoundarySummary;
  length: number;
};

const getBoundarySummary = (
  state: EditorState,
  boundary: number
): BoundarySummary => {
  const line = state.doc.lineAt(boundary);
  const lineNumber = line.number;
  const columnNumber = boundary - line.from + 1;

  return {
    line: lineNumber,
    column: columnNumber,
  };
};

export const getSelectionRangeSummary = (
  state: EditorState,
  range: SelectionRange
): SelectionRangeSummary => {
  const fromSummary = getBoundarySummary(state, range.from);
  const toSummary = getBoundarySummary(state, range.to);

  return {
    from: fromSummary,
    to: toSummary,
    length: range.to - range.from,
  };
};

export const StatusBar = ({
  format,
  selectionRangeSummaries,
  setTheme,
  theme,
  copyToClipBoard,
  testId,
}: StatusBarProps): React.JSX.Element => {
  const { t } = useTranslation();

  const cursorText = useMemo(() => {
    if (selectionRangeSummaries.length === 0) {
      return '-';
    }

    if (
      selectionRangeSummaries.length === 1 &&
      selectionRangeSummaries[0].length === 0
    ) {
      return (
        <Trans
          t={t as any}
          i18nKey="code-editor-cursor-position"
          values={{
            line: selectionRangeSummaries[0].to.line,
            column: selectionRangeSummaries[0].to.column,
          }}
        />
      );
    }

    if (selectionRangeSummaries.length === 1) {
      return (
        <Trans
          t={t as any}
          i18nKey="code-editor-cursor-position-selected"
          values={{
            line: selectionRangeSummaries[0].to.line,
            column: selectionRangeSummaries[0].to.column,
            count: selectionRangeSummaries[0].length,
          }}
        />
      );
    }

    const totalSelectionLength = selectionRangeSummaries.reduce(
      (sum, { length }) => sum + length,
      0
    );

    return (
      <Trans
        t={t as any}
        i18nKey="code-editor-cursor-position-multiple-selections"
        values={{
          selections: selectionRangeSummaries.length,
          count: totalSelectionLength,
        }}
      />
    );
  }, [selectionRangeSummaries, t]);

  return (
    <StyledStatusBar $theme={theme} data-testid={`${testId}-status-bar`}>
      <Flex gap={4}>
        <Tooltip content={t('copy')}>
          <Button
            icon="Copy"
            aria-label="copy"
            inverted={theme === 'dark'}
            onClick={copyToClipBoard}
            size="small"
            type="ghost"
          />
        </Tooltip>
        <Tooltip content={t('details-editor-format-tooltip')}>
          <Button
            icon="MagicWand"
            aria-label="format"
            inverted={theme === 'dark'}
            disabled={!format}
            onClick={format}
            size="small"
            type="ghost"
          />
        </Tooltip>
        <Dropdown
          content={
            <Menu>
              <Menu.Item
                icon="Sun"
                iconPlacement="left"
                onClick={() => setTheme('light')}
                toggled={theme === 'light'}
              >
                {t('light-theme')}
              </Menu.Item>
              <Menu.Item
                icon="Moon"
                iconPlacement="left"
                onClick={() => setTheme('dark')}
                toggled={theme === 'dark'}
              >
                {t('dark-theme')}
              </Menu.Item>
            </Menu>
          }
        >
          <Tooltip content={t('theme')}>
            <Button
              icon="ColorPalette"
              inverted={theme === 'dark'}
              type="ghost"
              size="small"
              aria-label="choose theme"
            />
          </Tooltip>
        </Dropdown>
      </Flex>
      <StyledStatusBarBody size="small">{cursorText}</StyledStatusBarBody>
    </StyledStatusBar>
  );
};

const StyledStatusBar = styled.div<{ $theme: CodeEditorTheme }>`
  align-items: center;
  background-color: ${({ $theme }) =>
    $theme === 'light'
      ? Colors['surface--status-undefined--muted--default']
      : Colors['surface--misc-code--medium--inverted']};
  color: ${({ $theme }) =>
    $theme === 'light'
      ? Colors['text-icon--medium']
      : Colors['text-icon--medium--inverted']};
  display: flex;
  height: 44px;
  justify-content: space-between;
  padding: 0 8px;
  width: 100%;
  border-radius: 0 0 6px 6px;
`;

const StyledStatusBarBody = styled(Body)`
  color: inherit;
`;
