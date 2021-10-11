import { NPTEvent } from 'modules/wellSearch/types';

export type NPTWell = {
  id: string;
  wellName: string;
  events: NPTEvent[];
};

export type NPTWellbore = {
  id: string;
  wellboreName: string;
  events: NPTEvent[];
};
