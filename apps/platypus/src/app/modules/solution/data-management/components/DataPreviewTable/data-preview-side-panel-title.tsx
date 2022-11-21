import { Body, Title } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

export type SidePanelTitleProps = {
  fieldName: string;
  listLength?: number;
  dataModelTypeName: string;
};

export const SidePanelTitle: React.FC<SidePanelTitleProps> = ({
  fieldName,
  dataModelTypeName,
  listLength,
}) => {
  const { t } = useTranslation('DataPreviewSidePanelTitle');

  return (
    <Body level={2} style={{ color: 'var(--cogs-text-icon--medium)' }}>
      <Title
        as="span"
        level={6}
        style={{ color: 'var(--cogs-text-icon--medium)' }}
      >
        {`${fieldName} ${listLength !== undefined ? `(${listLength})` : ''}`}
      </Title>
      {` ${t('side_panel_title_for', 'for')} `}
      <Title
        as="span"
        level={6}
        style={{ color: 'var(--cogs-text-icon--medium)' }}
      >
        {dataModelTypeName}
      </Title>
    </Body>
  );
};
