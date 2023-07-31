import { Report } from 'domain/reportManager/internal/types';

export type GlobalSidePanelTypes = {
  type: 'WELL_REPORT';
  data: Report['id'];
};

export interface GlobalState {
  sidePanel: ({ visible: true } & GlobalSidePanelTypes) | { visible: false };
}
