import { NptView } from 'domain/wells/npt/internal/types';

export type NptWell = {
  id: string;
  wellName: string;
  data: NptView[];
};

export type NptWellbore = {
  id: string;
  wellboreName: string;
  data: NptView[];
};
