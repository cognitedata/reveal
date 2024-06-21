import { DmsUniqueIdentifier, FdmNode, Source } from '../../../utilities/FdmSDK';

export type ObservationProperties = {
  // "ID as the node appears in the Source system"
  sourceId: string;
  // "Name of the source system node comes from"
  source: string;
  // "Title or name of the node"
  title: string;
  // "Long description of the node"
  description: string;
  // "Text based labels for generic use"
  labels: string[];
  // "Visibility of node (PUBLIC, PRIVATE, PROTECTED)"
  visibility: String;
  // "Who created this node?"
  createdBy: String;
  // "Who was the last person to update this node?"
  updatedBy: String;
  // "Is this item archived, and therefore hidden from most UIs?"
  isArchived: Boolean;
  // "The status of the observation (draft, completed, sent)"
  status: string;
  // "External ID of the associated CDF Asset"
  asset: DmsUniqueIdentifier;
  // "List of associated files"
  files: DmsUniqueIdentifier[];
  // "description of how the observation was troubleshooted"
  troubleshooting: string;
  // "Priority of the observation (Urgent, High ...)"
  priority: string;
  // "The observation type (Malfunction report, Maintenance request, etc.)"
  type: string;
  // "3D position"
  positionX: number;
  positionY: number;
  positionZ: number;
  // "Comments"
  comments: [CommentProperties];
};

export type CommentProperties = {
  createdBy: string;
  text: string;
};

export type Observation = FdmNode<ObservationProperties>;

export const OBSERVATION_SOURCE: Source = {
  type: 'view',
  version: '3c207ca2355dbb',
  externalId: 'Observation',
  space: 'observations'
};
