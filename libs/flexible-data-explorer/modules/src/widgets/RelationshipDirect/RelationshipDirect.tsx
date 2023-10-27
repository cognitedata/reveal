import { BaseWidgetProps } from '@fdx/components';

import { FileRelationshipDirect } from './modules/FileRelationshipDirect';
import { GenericRelationshipDirect } from './modules/GenericRelationshipDirect';
import { TimeseriesRelationshipDirect } from './modules/TimeseriesRelationshipDirect';

export interface RelationshipDirectProps extends BaseWidgetProps {
  type: {
    type: string;
    field: string;
  };
}

export const RelationshipDirectWidget: React.FC<RelationshipDirectProps> = (
  props
) => {
  if (props.type.type === 'Sequence') {
    return null;
  }

  if (props.type.type === 'TimeSeries') {
    return <TimeseriesRelationshipDirect {...props} />;
  }

  if (props.type.type === 'File') {
    return <FileRelationshipDirect {...props} />;
  }

  return <GenericRelationshipDirect {...props} />;
};
