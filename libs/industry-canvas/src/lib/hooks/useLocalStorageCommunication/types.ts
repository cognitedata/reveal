import { ContainerReference } from '../../types';

export type OpenedCanvas = {
  externalId: string;
  name: string;
};

export type PendingContainerReference = {
  canvasExternalId: string;
  containerReference: ContainerReference;
};
