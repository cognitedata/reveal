import { MetadataItem } from '@vision/modules/FileDetails/Components/FileMetadata/Types';

import { Label } from '@cognite/sdk';

export type FileInfoValueState = string | Label[] | number[] | null;

export type FileDetailsState = {
  metadataEdit: boolean;
  fileDetails: Record<string, FileInfoValueState>;
  fileMetaData: Record<number, MetadataItem>;
  loadingField: string | null;
};
