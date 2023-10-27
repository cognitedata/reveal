import { Widget } from '@fdx/components';

import { FDXFilePreview } from './FilePreview';
import { FileWidgetProps } from './FileWidget';

export const FileExpanded: React.FC<FileWidgetProps> = ({ fileId }) => {
  return (
    <Widget expanded fullWidth>
      <Widget.Body fullWidth>
        <FDXFilePreview fileId={fileId!} />
      </Widget.Body>
    </Widget>
  );
};
