import { FileRelationshipEdgesCollapsed } from './containers/collapsed/FileRelationshipEdgesCollapsed';
import { GenericRelationshipEdgesCollapsed } from './containers/collapsed/GenericRelationshipEdgesCollapsed';
import { TimeseriesRelationshipEdgesCollapsed } from './containers/collapsed/TimeseriesRelationshipEdgesCollapsed';
import { RelationshipEdgesProps } from './RelationshipEdgesWidget';

export const RelationshipEdgesCollapsed: React.FC<RelationshipEdgesProps> = (
  props
) => {
  if (props.type.type === 'File') {
    return <FileRelationshipEdgesCollapsed {...props} />;
  }

  if (props.type.type === 'TimeSeries') {
    return <TimeseriesRelationshipEdgesCollapsed {...props} />;
  }

  if (props.type.type === 'Sequence') {
    return null;
  }

  return <GenericRelationshipEdgesCollapsed {...props} />;
};
