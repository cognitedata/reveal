import { HeartbeatsReportResponse } from 'types/ApiInterface';
import { Source } from 'typings/interfaces';

export interface HeartbeatsConnector {
  source: Source.OPENWORKS | Source.STUDIO;
  instance: string;
}

export type HeartbeatsOutages = {
  connector: HeartbeatsReportResponse['connector'];
  outage: [number, number];
};
