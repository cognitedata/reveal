import { Report } from 'domain/reportManager/internal/types';

export type TableReport = Partial<Report> & { subRows?: Report[] };

export type UpdateReport = (
  newData: Partial<Report>,
  reportId: Report['id']
) => void;
