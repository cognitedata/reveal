import { Report } from './types';

export const DISCOVER_WELL_REPORT = 'discover-well-report';

export const DATA_SETS_MAP: Record<string, string> = {
  CASINGS: 'Casings',
  TRAJECTORY: 'Trajectory',
  NPT: 'NPT events',
  NDS: 'NDS events',
  WELL_LOGS: 'Well Logs',
  RELATED_DOCUMENTS: 'Related Documents',
  DIGITAL_ROCKS: 'Digital Rocks',
  GEOMECHANICS: 'Geomechanics',
  PPFG: 'PPFG',
  OTHERS: 'Others',
};

export const REPORT_FEEDBACK_REASONS: Record<Report['reason'], string> = {
  INCOMPLETE: 'Incomplete data',
  DUPLICATE: 'Duplicate data',
  SENSITIVE: 'Sensitive data',
  OTHER: 'Other',
};

export const REPORT_STATUS: Record<Report['status'], string> = {
  BACKLOG: 'Backlog',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  DISMISSED: 'Dismissed',
};
