import { Label } from '@cognite/sdk';
import { MetadataItem } from 'src/modules/FileDetails/Components/FileMetadata/Types';

export type FileInfoValueState = string | Label[] | number[] | null;

export type FileDetailsState = {
  metadataEdit: boolean;
  fileDetails: Record<string, FileInfoValueState>;
  fileMetaData: Record<number, MetadataItem>;
  loadingField: string | null;
};
