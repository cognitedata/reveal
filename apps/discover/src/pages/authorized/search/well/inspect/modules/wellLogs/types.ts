import { DepthMeasurement } from '@cognite/sdk-wells-v3';

export interface WellLog extends DepthMeasurement {
  id: string;
  wellName: string;
  wellboreName: string;
  modified: string;
}
