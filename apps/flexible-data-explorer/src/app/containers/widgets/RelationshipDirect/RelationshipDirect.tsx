import { BaseWidgetProps } from '../../../components/widget/Widget';

import { FileRelationshipDirect } from './containers/FileRelationshipDirect';
import { GenericRelationshipDirect } from './containers/GenericRelationshipDirect';
import { TimeseriesRelationshipDirect } from './containers/TimeseriesRelationshipDirect';

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
