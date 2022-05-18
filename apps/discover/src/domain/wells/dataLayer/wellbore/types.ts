import { Wellbore } from '@cognite/sdk-wells-v3';

// wellName should be removed from here
export interface WellboreDataLayer extends Wellbore {
  wellName: string;
}
