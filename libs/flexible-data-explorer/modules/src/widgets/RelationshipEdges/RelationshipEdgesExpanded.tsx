import { FileRelationshipEdgesExpanded } from './modules/expanded/FileRelationshipEdgeExpanded';
import { GenericRelationshipEdgesExpanded } from './modules/expanded/GenericRelationshipEdgeExpanded';
import { TimeseriesRelationshipEdgesExpanded } from './modules/expanded/TimeseriesRelationshipEdgeExpanded';
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
