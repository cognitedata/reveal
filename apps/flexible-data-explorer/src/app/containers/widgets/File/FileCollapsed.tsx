import { Button } from '../../../components/buttons/Button';
import { Widget } from '../../../components/widget/Widget';
import { useTranslation } from '../../../hooks/useTranslation';

import { FDXFilePreview } from './FilePreview';
import { FileWidgetProps } from './FileWidget';

export const FileCollapsed: React.FC<FileWidgetProps> = ({
  id,
  onExpandClick,
  fileId,
  rows,
  columns,
}) => {
  const { t } = useTranslation();

  return (
    <Widget id={id} rows={rows} columns={columns}>
      <Widget.Header title={t('FILE_PREVIEW_WIDGET_NAME')}>
        <Button.Fullscreen onClick={() => onExpandClick?.(id)} />
      </Widget.Header>

      <Widget.Body>
        <FDXFilePreview fileId={fileId!} />
      </Widget.Body>
    </Widget>
  );
};
