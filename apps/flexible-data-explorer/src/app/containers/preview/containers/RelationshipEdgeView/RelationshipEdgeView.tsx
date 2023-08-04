import { InstancePreviewProps } from '../../types';

import {
  FileRelationshipEdgeItem,
  FileRelationshipEdgeView,
} from './FileRelationshipEdgeView';
import {
  GenericRelationshipEdgeItem,
  GenericRelationshipEdgeView,
} from './GenericRelationshipEdgeView';
import {
  TimeseriesRelationshipEdgeItem,
  TimeseriesRelationshipEdgeView,
} from './TimeseriesRelationshipEdgeView';

export const RelationshipEdgeItem: React.FC<
  InstancePreviewProps & { type: { type: string; field: string } }
> = (props) => {
  if (props.type.type === 'Sequence') {
    return null;
  }

  if (props.type.type === 'File') {
    return <FileRelationshipEdgeItem {...props} />;
  }

  if (props.type.type === 'TimeSeries') {
    return <TimeseriesRelationshipEdgeItem {...props} />;
  }

  return <GenericRelationshipEdgeItem {...props} />;
};

export const RelationshipEdgeView: React.FC<
  InstancePreviewProps & { type: { type: string; field: string } }
> = (props) => {
  if (props.type.type === 'Sequence') {
    return null;
  }

  if (props.type.type === 'File') {
    return <FileRelationshipEdgeView {...props} />;
  }

  if (props.type.type === 'TimeSeries') {
    return <TimeseriesRelationshipEdgeView {...props} />;
  }

  return <GenericRelationshipEdgeView {...props} />;
};
