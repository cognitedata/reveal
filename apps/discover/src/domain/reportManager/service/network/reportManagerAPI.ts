import { Report, ReportFilter } from '../../internal/types';

import { EventsReportDao } from './EventsReportDao';
import { ReportDaoInterface } from './ReportDaoInterface';

class ReportManager {
  private dao: ReportDaoInterface;

  constructor() {
    this.dao = new EventsReportDao();
  }

  public async create(report: Report) {
    return this.dao.create([report]);
  }

  public async search(filters: ReportFilter) {
    return this.dao.search(filters);
  }

  public async update(id: number, report: Partial<Report>) {
    return this.dao.update(id, report);
  }

  public async delete(ids: number[]) {
    return this.dao.delete(ids);
  }
}

export const reportManagerAPI = new ReportManager();
