import { CogniteOrnate } from '@cognite/ornate';

export type DiscrepancyInteractionHandler = (
  ornateRef: CogniteOrnate | undefined,
  nodeId: string
) => void;
