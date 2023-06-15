import { Dispatch, SetStateAction, useMemo } from 'react';

import styled from 'styled-components';

import { EditorState, SelectionRange } from '@codemirror/state';
import { Trans, useTranslation } from '@transformations/common';
import { TransformationRead } from '@transformations/types';
import { shouldDisableUpdatesOnTransformation } from '@transformations/utils';

import { CodeEditorTheme } from '@cognite/cdf-utilities';
import {
  Body,
  Button,
  Colors,
  Dropdown,
  Flex,
  Icon,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';

type StatusBarProps = {
  formatSql: () => void;
  selectionRangeSummaries: SelectionRangeSummary[];
  setTheme: Dispatch<SetStateAction<CodeEditorTheme>>;
  theme: CodeEditorTheme;
  transformation: TransformationRead;
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

const StatusBar = ({
  formatSql,
  selectionRangeSummaries,
  setTheme,
  theme,
  transformation,
}: StatusBarProps): JSX.Element => {
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
        i18nKey="code-editor-cursor-position-multiple-selections"
        values={{
          selections: selectionRangeSummaries.length,
          count: totalSelectionLength,
        }}
      />
    );
  }, [selectionRangeSummaries]);

  return (
    <StyledStatusBar $theme={theme}>
      <Flex gap={4}>
        <Tooltip content={t('details-editor-format-tooltip')}>
          <Button
            icon="MagicWand"
            inverted={theme === 'dark'}
            disabled={shouldDisableUpdatesOnTransformation(transformation)}
            onClick={formatSql}
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
            />
          </Tooltip>
        </Dropdown>
        <Dropdown
          content={
            <Menu>
              <StyledLink
                target="_blank"
                rel="noopener noreferrer"
                href="https://spark.apache.org/docs/3.2.1/api/sql/"
              >
                <Flex gap={12} justifyContent="space-between">
                  {t('built-in-spark-sql-functions')}
                  <Icon type="ExternalLink" />
                </Flex>
              </StyledLink>
              <StyledLink
                target="_blank"
                rel="noopener noreferrer"
                href="https://docs.cognite.com/cdf/integration/guides/transformation/write_sql_queries#custom-sql-functions"
              >
                <Flex gap={12} justifyContent="space-between">
                  {t('cognite-custom-sql-functions')}
                  <Icon type="ExternalLink" />
                </Flex>
              </StyledLink>
            </Menu>
          }
        >
          <Tooltip content={t('function_other')}>
            <Button
              icon="Function"
              inverted={theme === 'dark'}
              type="ghost"
              size="small"
            />
          </Tooltip>
        </Dropdown>
      </Flex>
      <StyledStatusBarBody level={3}>{cursorText}</StyledStatusBarBody>
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

const StyledLink = styled.a`
  &:hover {
    background-color: ${Colors['surface--interactive--hover']};
    color: ${Colors['text-icon--interactive--hover']};
  }
  padding: 8px;
`;

export default StatusBar;
