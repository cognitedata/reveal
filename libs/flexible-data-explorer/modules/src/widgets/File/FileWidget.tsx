import { BaseWidgetProps } from '@fdx/components';

import { FileCollapsed } from './FileCollapsed';
import { FileExpanded } from './FileExpanded';

export interface FileWidgetProps extends BaseWidgetProps {
  data?: Record<string, any>;
  fileId?: number;
}

// NOTE: Generalize the toggle between expanded and collapse, somehow.
export const FileWidget: React.FC<FileWidgetProps> = (props) => {
  if (props.isExpanded) {
    return <FileExpanded {...props} />;
  }
  return <FileCollapsed {...props} />;
};
