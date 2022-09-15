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
  PPFG: 'Pore pressure fracture gradient',
  OTHERS: 'Others',
};

export const DATA_SET_FEEDBACK_TYPES: Record<string, string> = {
  INCOMPLETE: 'Incomplete data',
  DUPLICATE: 'Duplicate data',
  SENSITIVE: 'Sensitive data',
  OTHER: 'Other',
};
