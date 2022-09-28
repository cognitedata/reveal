import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { Tooltip, Button, Flex, Label } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

type Props = {
  title: string;
  transformationId?: number | null;
  isDeleteButtonDisabled: boolean;
  onTransformationClick: (value: boolean) => void;
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
  transformationId,
  isDeleteButtonDisabled,
  onTransformationClick,
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
      <Flex justifyContent={'flex-end'}>
        <Button
          type="ghost"
          icon="Delete"
          disabled={isDeleteButtonDisabled}
          style={{ marginRight: '8px' }}
          aria-label="Delete"
          data-cy="btn-pagetoolbar-delete"
          onClick={onDeleteClick}
        />

        <Button
          data-cy="create-new-row-btn"
          type="primary"
          icon="Add"
          iconPlacement="left"
          style={{ marginRight: '8px' }}
          onClick={onCreateClick}
        >
          {t('create-new-row', 'Create')}
        </Button>
        {!transformationId && publishedRowsCount !== 0 && (
          <Tooltip
            content={t(
              'transformation_tooltip',
              'No transformation defined for data in this table'
            )}
          >
            <Button
              type="primary"
              icon="ExternalLink"
              iconPlacement="right"
              disabled={true}
              onClick={() => onTransformationClick(true)}
            >
              {t('transformation-edit', 'Edit transformations')}
            </Button>
          </Tooltip>
        )}
        {transformationId && (
          <Button
            data-cy="edit-transformation"
            type="primary"
            icon="ExternalLink"
            iconPlacement="left"
            onClick={() => onTransformationClick(true)}
          >
            {t('transformation-edit', 'Edit transformations')}
          </Button>
        )}
      </Flex>
    </PageToolbar>
  );
}
