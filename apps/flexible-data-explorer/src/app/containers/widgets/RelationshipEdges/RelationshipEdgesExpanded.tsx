import { FileRelationshipEdgesExpanded } from './containers/expanded/FileRelationshipEdgeExpanded';
import { GenericRelationshipEdgesExpanded } from './containers/expanded/GenericRelationshipEdgeExpanded';
import { TimeseriesRelationshipEdgesExpanded } from './containers/expanded/TimeseriesRelationshipEdgeExpanded';
import { RelationshipEdgesProps } from './RelationshipEdgesWidget';

export const RelationshipEdgesExpanded: React.FC<RelationshipEdgesProps> = (
  props
) => {
  if (props.type.type === 'File') {
    return <FileRelationshipEdgesExpanded {...props} />;
  }

  if (props.type.type === 'TimeSeries') {
    return <TimeseriesRelationshipEdgesExpanded {...props} />;
  }

  return <GenericRelationshipEdgesExpanded {...props} />;
};
