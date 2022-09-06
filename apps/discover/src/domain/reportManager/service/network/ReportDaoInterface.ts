import { Report, ReportFilter } from '../../internal/types';

export interface ReportDaoInterface {
  create: (reports: Report[]) => Promise<Report[]>;

  search: (filter: ReportFilter) => Promise<Report[]>;

  update: (id: number, payload: Partial<Report>) => Promise<Report>;

  delete: (ids: number[]) => Promise<void | object>;
}
