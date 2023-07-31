import { getCogniteSDKClient } from 'utils/getCogniteSDKClient';

import { EventsAPI, CogniteInternalId } from '@cognite/sdk';

import { Report, ReportFilter } from '../../internal/types';
import { adaptEventToReport } from '../adapters/adaptEventToReport';
import { adaptReportFilterToEventFilter } from '../adapters/adaptReportFilterToEventFilter';
import { adaptReportToEvent } from '../adapters/adaptReportToEvent';
import { adaptReportToPatchEvent } from '../adapters/adaptReportToPatchEvent';

import { ReportDaoInterface } from './ReportDaoInterface';

export class EventsReportDao implements ReportDaoInterface {
  private eventsAPI: EventsAPI;

  constructor() {
    this.eventsAPI = getCogniteSDKClient().events;
  }

  public async create(reports: Report[]) {
    return this.eventsAPI
      .create(reports.map(adaptReportToEvent))
      .then((events) => events.map(adaptEventToReport));
  }

  public async search(filters: ReportFilter) {
    const eventsFilter = adaptReportFilterToEventFilter(filters);
    return this.eventsAPI
      .list(eventsFilter)
      .autoPagingToArray({ limit: Infinity })
      .then((events) => events.map(adaptEventToReport));
  }

  public async update(id: CogniteInternalId, partialReport: Partial<Report>) {
    const eventToUpdate = adaptReportToPatchEvent(partialReport);
    return this.eventsAPI
      .update([{ id, ...eventToUpdate }])
      .then((events) => events.map(adaptEventToReport))
      .then((reports) => reports[0]);
  }

  public async delete(ids: number[]) {
    return this.eventsAPI.delete(ids.map((id) => ({ id })));
  }
}
