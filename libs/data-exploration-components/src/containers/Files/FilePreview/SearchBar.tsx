import { useMemo } from 'react';

import styled from 'styled-components';

import {
  Button,
  InputExp,
  ToolBar,
  Tooltip,
  ToolBarButton,
} from '@cognite/cogs.js';

import { TFunction, useTranslation } from '@data-exploration-lib/core';

import { UseCurrentSearchResultState } from './hooks/useCurrentSearchResult';
import { UseSearchBarState } from './hooks/useSearchBarState';

const SEARCHABLE_PAGES_LIMIT = 50;

const getStatusAndStatusText = (
  value: string,
  hasOcrData: boolean,
  numberOfPages: number,
  t: TFunction
): { status: 'critical' | 'warning'; statusText: string } | undefined => {
  if (!hasOcrData && value.length > 0) {
    return {
      status: 'critical',
      statusText: t('FILE_NOT_SEARCHABLE', 'This document is not searchable'),
    };
  }

  if (numberOfPages > SEARCHABLE_PAGES_LIMIT) {
    return {
      status: 'warning',
      statusText: t(
        'FILE_SEARCHABLE_LIMIT',
        `Only first ${SEARCHABLE_PAGES_LIMIT} pages are searchable`,
        { limit: SEARCHABLE_PAGES_LIMIT }
      ),
    };
  }

  return undefined;
};

export type SearchBarProps = {
  isOpen: boolean;
  value: string;
  numberOfSearchResults: number;
  onChange: (value: string) => void;
  hasOcrData: boolean;
  numberOfPages: number;
} & UseCurrentSearchResultState &
  Pick<
    UseSearchBarState,
    'onSearchOpen' | 'onSearchClose' | 'searchBarInputRef'
  >;

export const SearchBar = ({
  isOpen,
  value,
  onChange,
  onSearchOpen,
  onSearchClose,
  searchBarInputRef,
  currentSearchResultIndex,
  numberOfSearchResults,
  onNextResult,
  onPreviousResult,
  hasOcrData,
  numberOfPages,
}: SearchBarProps) => {
  const { t } = useTranslation();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      onSearchClose();
      return;
    }

    if (event.key === 'Enter') {
      if (event.shiftKey) {
        onPreviousResult();
        return;
      }
      onNextResult();
    }

    // We don't want the browser's find-in-page to open when the user presses cmd/ctrl+f when the search bar is in focus
    if (event.key === 'f' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      onSearchOpen(); // This selects all the text in the input field
    }
  };

  const NextPrevActions: ToolBarButton[] = [
    {
      icon: 'ArrowUp',
      onClick: onPreviousResult,
      description: t('PREVIOUS_SEARCH_RESULT', 'Previous search result'),
      'aria-label': 'Previous search result',
    },
    {
      icon: 'ArrowDown',
      onClick: onNextResult,
      description: t('NEXT_SEARCH_RESULT', 'Next search result'),
      'aria-label': 'Next search result',
    },
  ];

  // We only want to show the error message after the user has typed something in the search bar.
  // This is to gather "as real" metrics as possible (e.g. how many users are trying to search in documents that don't have OCR data).
  // In the future we probably want to disable or hide the search bar for documents that don't have OCR data.
  const statusAndStatusText = useMemo(
    () => getStatusAndStatusText(value, hasOcrData, numberOfPages, t),
    [value, hasOcrData, numberOfPages]
  );

  if (isOpen) {
    return (
      <ToolBar direction="horizontal" style={{ gap: '4px' }}>
        <>
          <RelativeWrapper>
            <AbsoluteWrapper>
              <InputExp
                ref={searchBarInputRef as any}
                icon="Search"
                placeholder={`${t('FIND_IN_FILE', 'Find in document')}...`}
                suffix={`${currentSearchResultIndex}/${numberOfSearchResults}`}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                status={statusAndStatusText?.status}
                statusText={statusAndStatusText?.statusText}
              />
            </AbsoluteWrapper>
          </RelativeWrapper>
          <ToolBar.ButtonGroup buttonGroup={NextPrevActions} />
        </>
        <Button
          icon="Close"
          type="ghost"
          aria-label="Close"
          onClick={onSearchClose}
        />
      </ToolBar>
    );
  }

  return (
    <ToolBar>
      <Tooltip content={t('FIND_IN_FILE', 'Find in document')}>
        <Button
          icon="Search"
          aria-label="Find in document"
          type="ghost"
          onClick={onSearchOpen}
        />
      </Tooltip>
    </ToolBar>
  );
};

const RelativeWrapper = styled.div`
  position: relative;
  min-width: 220px;
  min-height: 36px;
`;

const AbsoluteWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
`;
