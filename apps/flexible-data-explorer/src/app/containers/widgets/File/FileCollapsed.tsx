import { Button } from '../../../components/buttons/Button';
import { Widget } from '../../../components/widget/Widget';

import { FDXFilePreview } from './FilePreview';
import { FileWidgetProps } from './FileWidget';

export const FileCollapsed: React.FC<FileWidgetProps> = ({
  id,
  onExpandClick,
  fileId,
  rows,
  columns,
}) => {
  return (
    <Widget id={id} rows={rows} columns={columns}>
      <Widget.Header title="File preview" subtitle={`${fileId}`}>
        <Button.Fullscreen onClick={() => onExpandClick?.(id)} />
      </Widget.Header>

      <Widget.Body>
        <FDXFilePreview fileId={fileId!} />
      </Widget.Body>
    </Widget>
  );
};
