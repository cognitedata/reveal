import { DocumentPayloadLabel } from 'modules/api/documents/types';

export const getMockLabels: DocumentPayloadLabel[] = [
  { id: 'Unknown', name: 'Unknown', count: 10 },
  { id: 'PDF', name: 'PDF', count: 20 },
  { id: 'Label-1-ID', name: 'Label 1 Name', count: 30 },
];
