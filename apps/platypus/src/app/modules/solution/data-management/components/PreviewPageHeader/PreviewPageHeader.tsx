import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { Tooltip, Button, Flex, Label } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { PageHeaderDivider } from '../DataPreviewTable/elements';
import { TransformationDropdown } from '@platypus-app/modules/solution/data-management/components/TransformationDropdown';
import useTransformations from '@platypus-app/modules/solution/data-management/hooks/useTransformations';
import { BulkPopulationButton } from '@platypus-app/modules/solution/data-management/components/BulkPopulationButton';
import {
  useManualPopulationFeatureFlag,
  useDataManagementDeletionFeatureFlag,
  useSuggestionsFeatureFlag,
  useTransformationsFeatureFlag,
} from '@platypus-app/flags';
import * as S from './elements';
import { useRef } from 'react';

type Props = {
  dataModelExternalId: string;
  draftRowsCount: number;
  isDeleteButtonDisabled: boolean;
  onAddTransformationClick: () => void;
  onCreateClick: () => void;
  onDeleteClick: () => void;
  onSuggestionsClick: () => void;
  onDraftRowsCountClick: () => void;
  onPublishedRowsCountClick: () => void;
  onSearchInputValueChange: (value: string) => void;
  publishedRowsCount: number;
  shouldShowDraftRows: boolean;
  shouldShowPublishedRows: boolean;
  suggestionsAvailable?: boolean;
  title: string;
  typeName: string;
  version: string;
};

export function PreviewPageHeader({
  dataModelExternalId,
  draftRowsCount,
  isDeleteButtonDisabled,
  onAddTransformationClick,
  onCreateClick,
  onDeleteClick,
  onSuggestionsClick,
  onDraftRowsCountClick,
  onPublishedRowsCountClick,
  onSearchInputValueChange,
  publishedRowsCount,
  shouldShowDraftRows,
  shouldShowPublishedRows,
  suggestionsAvailable = false,
  title,
  typeName,
  version,
}: Props) {
  const { t } = useTranslation('DataPreview');
  const isTransformationsEnabled = useTransformationsFeatureFlag();
  const { isEnabled: isManualPopulationEnabled } =
    useManualPopulationFeatureFlag();
  const { isEnabled: isDeleteEnabled } = useDataManagementDeletionFeatureFlag();
  const { isEnabled: isSuggestionsEnabled } = useSuggestionsFeatureFlag();
  const { data: transformations } = useTransformations({
    dataModelExternalId,
    isEnabled: isTransformationsEnabled,
    typeName,
    version,
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  const tableHasRows = draftRowsCount > 0 || publishedRowsCount > 0;
  const shouldShowActions =
    (transformations && transformations.length > 0) || tableHasRows;

  const renderTransformations = () => {
    if (!isTransformationsEnabled) {
      return false;
    }

    return transformations && transformations.length > 0 ? (
      <TransformationDropdown
        onAddClick={onAddTransformationClick}
        dataModelExternalId={dataModelExternalId}
        typeName={typeName}
        version={version}
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
        <>
          <Tooltip
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
            <Label
              onClick={onPublishedRowsCountClick}
              variant="default"
              size="medium"
              style={{ marginLeft: '8px' }}
            >
              <span
                style={{
                  opacity: !shouldShowPublishedRows ? '0.2' : '1.0',
                }}
              >
                {publishedRowsCount}
              </span>
            </Label>
          </Tooltip>
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
            <Label
              onClick={draftRowsCount ? onDraftRowsCountClick : undefined}
              variant="unknown"
              size="medium"
              style={{ marginLeft: '4px' }}
            >
              <span
                style={{
                  opacity:
                    !shouldShowDraftRows || !draftRowsCount ? '0.2' : '1.0',
                }}
              >
                {draftRowsCount}
              </span>
            </Label>
          </Tooltip>
        </>
      }
    >
      {shouldShowActions && (
        <Flex justifyContent={'flex-end'} gap={8}>
          {publishedRowsCount > 0 && (
            <>
              <S.SearchInput
                clearable={{
                  callback: () => {
                    // input is not controlled to make debouncing easier, but that means
                    // we need to clear it manually
                    if (searchInputRef.current) {
                      searchInputRef.current.value = '';
                    }

                    onSearchInputValueChange('');
                  },
                }}
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
            publishedRowsCount > 0 && <PageHeaderDivider />}
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
            >
              {t('create-new-row', 'Add instance')}
            </Button>
          )}
          {(isSuggestionsEnabled || isTransformationsEnabled) && (
            <PageHeaderDivider />
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
