import { EquipmentElementKey } from '.';

export type ScannerBoundingBox = {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
};

export type ScannerDataElement = {
  value?: string | number;
  unit?: string;
  confidence?: number;
  source_document_id?: number;
  page_number?: number;
  bounding_box?: ScannerBoundingBox;
};

export type ScannerData =
  | {
      equipment: {
        [key in EquipmentElementKey]: ScannerDataElement | null;
      } & { [key: string]: ScannerDataElement | null };
    }
  | undefined;
