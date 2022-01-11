import { Metadata } from '@cognite/sdk';

import { EquipmentElement, ScarletDocument } from '../types';

export type APIState<T> = {
  loading: boolean;
  error?: any;
  data?: T;
};

export type PCMSData = {
  components: Metadata[];
  equipment?: Metadata;
};

export type DocumentsData = ScarletDocument[];

export type ScannerElement = {
  bounding_polygon: { x: number; y: number }[];
  confidence: number;
  page_number: 1;
  source_document_id: 475972712095609;
  unit: 'feet';
  value: 1337;
};

export type ScannerDataElement = {
  value?: string | number;
  unit?: string;
  confidence?: number;
  source_document_id?: number;
  page_number?: number;
  bounding_box?: {
    x_min: number;
    y_min: number;
    x_max: number;
    y_max: number;
  };
};

export type ScannerData =
  | {
      equipment: {
        [key in EquipmentElement]: ScannerDataElement | null;
      } & { [key: string]: ScannerDataElement | null };
    }
  | undefined;
