import { DisplayReport } from 'domain/reportManager/internal/types';

export type TableReport = Partial<DisplayReport> & {
  subRows?: DisplayReport[];
};
