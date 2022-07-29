import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { Tooltip, Button } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import styled from 'styled-components';

type Props = {
  title: string;
  previewDataLength: number;
  transformationId?: number | null;
  onTransformationClick: (value: boolean) => void;
};

export function PreviewPageHeader({
  title,
  transformationId,
  previewDataLength,
  onTransformationClick,
}: Props) {
  const { t } = useTranslation('DataPreview');
  return (
    <PageToolbar
      title={title}
      behindTitle={
        previewDataLength ? <DataLength>{previewDataLength}</DataLength> : null
      }
    >
      {!transformationId && previewDataLength !== 0 && (
        <Tooltip
          content={t(
            'transformation_tooltip',
            'No transformation defined for data in this table'
          )}
        >
          <Button
            data-cy="edit-transformation"
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
          iconPlacement="right"
          onClick={() => onTransformationClick(true)}
        >
          {t('transformation-edit', 'Edit transformations')}
        </Button>
      )}
    </PageToolbar>
  );
}

const DataLength = styled.span`
  margin-left: 8px;
  padding: 2px 6px;
  width: 20px;
  height: 20px;
  background: rgba(110, 133, 252, 0.1);
  border-radius: 4px;
  color: #2b3a88;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;
