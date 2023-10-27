import { BaseWidgetProps } from '@fdx/components';

import { RelationshipEdgesCollapsed } from './RelationshipEdgesCollapsed';
import { RelationshipEdgesExpanded } from './RelationshipEdgesExpanded';

export interface RelationshipEdgesProps extends BaseWidgetProps {
  type: {
    type: string;
    field: string;
  };
}

// NOTE: Generalize the toggle between expanded and collapse, somehow.
export const RelationshipEdgesWidget: React.FC<RelationshipEdgesProps> = (
  props
) => {
  if (props.isExpanded) {
    return <RelationshipEdgesExpanded {...props} />;
  }
  return <RelationshipEdgesCollapsed {...props} />;
};
