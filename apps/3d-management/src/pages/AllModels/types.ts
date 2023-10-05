import { Model3D, Revision3D } from '@cognite/sdk';

export type ResourceType = '3D models' | '360 images';

export type Model3DWithType = Model3D & {
  type: 'img360';
  siteId?: string;
  lastUpdatedTime?: Date;
};
export type InternalThreeDRevisionData = Revision3D;
export interface InternalThreeDModelData extends Model3DWithType {
  revisions?: InternalThreeDRevisionData[];
}
