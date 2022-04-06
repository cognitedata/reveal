import { CogniteEvent } from '@cognite/sdk';

export interface SnifferEvent extends CogniteEvent {
  id: number;
  createdTime: Date;
  cdfProject: string;
}
