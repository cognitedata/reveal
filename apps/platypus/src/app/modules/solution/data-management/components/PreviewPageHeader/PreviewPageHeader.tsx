import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { Tooltip, Button, Flex, Label } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { BulkPopulationButton } from '../DataPreviewTable/BulkPopulationButton';
import { PageHeaderDivider } from '../DataPreviewTable/elements';

type Props = {
  title: string;
  isDeleteButtonDisabled: boolean;
  onCreateClick: () => void;
  onDeleteClick: () => void;
  draftRowsCount: number;
  publishedRowsCount: number;
  shouldShowDraftRows: boolean;
  shouldShowPublishedRows: boolean;
  onPublishedRowsCountClick: () => void;
  onDraftRowsCountClick: () => void;
};

export function PreviewPageHeader({
  title,
  isDeleteButtonDisabled,
  onCreateClick,
  onDeleteClick,
  draftRowsCount,
  shouldShowDraftRows,
  publishedRowsCount,
  shouldShowPublishedRows,
  onPublishedRowsCountClick,
  onDraftRowsCountClick,
}: Props) {
  const { t } = useTranslation('DataPreview');

  const isTableEmpty = draftRowsCount === 0 && publishedRowsCount === 0;
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
                style={{ opacity: !shouldShowPublishedRows ? '0.2' : '1.0' }}
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
              onClick={onDraftRowsCountClick}
              variant="unknown"
              size="medium"
              style={{ marginLeft: '4px' }}
            >
              <span style={{ opacity: !shouldShowDraftRows ? '0.2' : '1.0' }}>
                {draftRowsCount}
              </span>
            </Label>
          </Tooltip>
        </>
      }
    >
      {!isTableEmpty && (
        <Flex justifyContent={'flex-end'} gap={8}>
          <Button
            type="ghost"
            icon="Delete"
            disabled={isDeleteButtonDisabled}
            aria-label="Delete"
            data-cy="btn-pagetoolbar-delete"
            onClick={onDeleteClick}
          />
          <Button
            data-cy="create-new-row-btn"
            type="primary"
            icon="Add"
            iconPlacement="left"
            onClick={onCreateClick}
          >
            {t('create-new-row', 'Add instance')}
          </Button>
          <PageHeaderDivider />
          <BulkPopulationButton />
        </Flex>
      )}
    </PageToolbar>
  );
}
