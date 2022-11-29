import { PrimaryKeyMethod } from 'components/CreateTableModal/CreateTableModal';
import { useCSVUpload } from './csv-upload';
import { useJSONUpload } from './json-upload';

type RAWUpload = {
  parsePercentage?: number;
  uploadPercentage?: number;
  columns?: string[];
  isUpload?: boolean;
  isUploadFailed?: boolean;
  isUploadCompleted?: boolean;
  isParsing?: boolean;
  onConfirmUpload?: (database: string, table: string) => void;
};

export const DEFAULT_FILE_PROPS = {
  accept: '.csv, .json',
  multiple: false,
  name: 'file',
};

export const useUpload = (
  file?: File,
  selectedPrimaryKeyMethod?: PrimaryKeyMethod,
  selectedColumnIndex?: number
): RAWUpload => {
  const csvUpload = useCSVUpload(
    file?.type === 'text/csv' ? file : undefined,
    selectedPrimaryKeyMethod,
    selectedColumnIndex ?? -1 // FIXME
  );
  const jsonUpload = useJSONUpload(
    file?.type === 'application/json' ? file : undefined,
    selectedPrimaryKeyMethod,
    selectedColumnIndex
  );

  if (file?.type === 'text/csv') {
    return csvUpload;
  }

  if (file?.type === 'application/json') {
    return jsonUpload;
  }

  return {};
};
