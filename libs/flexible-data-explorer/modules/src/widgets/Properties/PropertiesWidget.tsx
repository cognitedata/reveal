import { BaseWidgetProps } from '@fdx/components';

import { PropertiesCollapsed } from './PropertiesCollapsed';
import { PropertiesExpanded } from './PropertiesExpanded';

export interface PropertiesProps extends BaseWidgetProps {
  data?: Record<string, any>;
}

// NOTE: Generalize the toggle between expanded and collapse, somehow.
export const PropertiesWidget: React.FC<PropertiesProps> = (props) => {
  if (props.isExpanded) {
    return <PropertiesExpanded {...props} />;
  }
  return <PropertiesCollapsed {...props} />;
};
