import { useRef } from 'react';

import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import {
  useManualPopulationFeatureFlag,
  useDataManagementDeletionFeatureFlag,
  useSuggestionsFeatureFlag,
  useTransformationsFeatureFlag,
} from '@platypus-app/flags';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { BulkPopulationButton } from '@platypus-app/modules/solution/data-management/components/BulkPopulationButton';
import { TransformationDropdown } from '@platypus-app/modules/solution/data-management/components/TransformationDropdown';
import useTransformations from '@platypus-app/modules/solution/data-management/hooks/useTransformations';

import { Tooltip, Button, Flex, Chip, Divider } from '@cognite/cogs.js';

import * as S from './elements';

type Props = {
  children?: React.ReactNode;
  draftRowsCount: number;
  filteredRowsCount: null | undefined | number;
  isDeleteButtonDisabled: boolean;
  onAddTransformationClick: () => void;
  onCreateClick: () => void;
  onDeleteClick: () => void;
  onDraftRowsCountClick: () => void;
  onPublishedRowsCountClick: () => void;
  onRefreshClick: () => void;
  onSearchInputValueChange: (value: string) => void;
  onSuggestionsClick: () => void;
  publishedRowsCount: number;
  shouldShowDraftRows: boolean;
  shouldShowPublishedRows: boolean;
  space: string;
  suggestionsAvailable?: boolean;
  title: string;
  typeName: string;
  viewVersion?: string;
};

export function PreviewPageHeader({
  children,
  draftRowsCount,
  filteredRowsCount,
  isDeleteButtonDisabled,
  onAddTransformationClick,
  onCreateClick,
  onDeleteClick,
  onDraftRowsCountClick,
  onPublishedRowsCountClick,
  onRefreshClick,
  onSearchInputValueChange,
  onSuggestionsClick,
  publishedRowsCount,
  shouldShowDraftRows,
  shouldShowPublishedRows,
  space,
  suggestionsAvailable = false,
  title,
  typeName,
  viewVersion,
}: Props) {
  const { t } = useTranslation('DataPreview');
  const isTransformationsEnabled = useTransformationsFeatureFlag();
  const { isEnabled: isManualPopulationEnabled } =
    useManualPopulationFeatureFlag();
  const { isEnabled: isDeleteEnabled } = useDataManagementDeletionFeatureFlag();
  const { isEnabled: isSuggestionsEnabled } = useSuggestionsFeatureFlag();
  const { data: transformations } = useTransformations({
    space,
    isEnabled: isTransformationsEnabled,
    typeName,
    viewVersion,
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const tableHasRows = draftRowsCount > 0 || publishedRowsCount > 0;
  const shouldShowActions =
    (transformations && transformations.length > 0) || tableHasRows;

  const renderTransformations = () => {
    if (!isTransformationsEnabled || !viewVersion) {
      return false;
    }

    return transformations && transformations.length > 0 ? (
      <TransformationDropdown
        onAddClick={onAddTransformationClick}
        space={space}
        typeName={typeName}
        viewVersion={viewVersion}
      />
    ) : (
      <BulkPopulationButton onClick={onAddTransformationClick}>
        {t('load-data-button', 'Bulk population')}
      </BulkPopulationButton>
    );
  };

  return (
    <PageToolbar
      title={title}
      behindTitle={
        <Flex alignItems="center" gap={8}>
          <Tooltip
            disabled={!isManualPopulationEnabled}
            content={`${
              shouldShowPublishedRows
                ? t(
                    'toggle-published-rows-tooltip-msg',
                    'Click to hide published instances'
                  )
                : t(
                    'toggle-published-rows-tooltip-msg',
                    'Click to show published instances'
                  )
            }`}
          >
            <Chip
              onClick={
                isManualPopulationEnabled
                  ? onPublishedRowsCountClick
                  : undefined
              }
              size="small"
              type="neutral"
              style={{
                marginLeft: '8px',
                opacity: !shouldShowPublishedRows ? '0.2' : '1.0',
              }}
              label={`${
                filteredRowsCount !== null && filteredRowsCount !== undefined
                  ? filteredRowsCount
                  : publishedRowsCount
              }`}
            />
          </Tooltip>
          {isManualPopulationEnabled && (
            <Tooltip
              content={`${
                shouldShowDraftRows
                  ? t(
                      'toggle-draft-rows-tooltip-msg',
                      'Click to hide draft instances'
                    )
                  : t(
                      'toggle-draft-rows-tooltip-msg',
                      'Click to show draft instances'
                    )
              }`}
            >
              <Chip
                onClick={draftRowsCount ? onDraftRowsCountClick : undefined}
                size="small"
                style={{
                  marginLeft: '4px',
                  opacity:
                    !shouldShowDraftRows || !draftRowsCount ? '0.2' : '1.0',
                }}
                label={`${draftRowsCount}`}
              />
            </Tooltip>
          )}
          <Tooltip content={t('header-tooltip-refresh', 'Refresh table')}>
            <Button
              icon="Refresh"
              onClick={onRefreshClick}
              aria-label="Refresh data"
              size="small"
              type="ghost-accent"
            />
          </Tooltip>
        </Flex>
      }
    >
      {shouldShowActions && (
        <Flex justifyContent="flex-end" gap={8} alignItems="center">
          {children}
          {publishedRowsCount > 0 && (
            <>
              <S.SearchInput
                clearable={
                  // cogs bug workaround
                  searchInputRef.current?.value
                    ? {
                        callback: () => {
                          // input is not controlled to make debouncing easier, but that means
                          // we need to clear it manually
                          if (searchInputRef.current) {
                            searchInputRef.current.value = '';
                          }

                          onSearchInputValueChange('');
                        },
                      }
                    : undefined
                }
                iconPlacement="left"
                icon="Search"
                onChange={(e) => onSearchInputValueChange(e.target.value)}
                placeholder="Search"
                ref={searchInputRef}
                type="search"
              />
            </>
          )}
          {(isDeleteEnabled || isManualPopulationEnabled) &&
            publishedRowsCount > 0 && (
              <Divider direction="vertical" length="16px" weight="2px" />
            )}
          {isDeleteEnabled && (
            <Button
              type="ghost"
              icon="Delete"
              disabled={isDeleteButtonDisabled}
              aria-label="Delete"
              data-cy="btn-pagetoolbar-delete"
              onClick={onDeleteClick}
            />
          )}
          {isManualPopulationEnabled && (
            <Button
              data-cy="create-new-row-btn"
              type="primary"
              icon="Add"
              iconPlacement="left"
              onClick={onCreateClick}
              style={{
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
              }}
            >
              {t('create-new-row', 'Add instance')}
            </Button>
          )}
          {(isSuggestionsEnabled || isTransformationsEnabled) && (
            <Divider direction="vertical" length="16px" weight="2px" />
          )}
          {isSuggestionsEnabled && (
            <S.SuggestionButton
              icon="LightBulb"
              aria-label="Suggestions"
              onClick={onSuggestionsClick}
              data-cy={`suggestions-button${
                suggestionsAvailable ? '-active' : ''
              }`}
              // https://stackoverflow.com/questions/57586654/styled-component-attrs-react-does-not-recognize-prop
              $isActive={suggestionsAvailable}
            >
              Suggestions
            </S.SuggestionButton>
          )}
          {renderTransformations()}
        </Flex>
      )}
    </PageToolbar>
  );
}
