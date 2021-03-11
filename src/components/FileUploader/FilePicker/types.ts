// Cogs* name is used here since this FilePicker component will be proposed to cogs
// if it won't make it to the cogs - types should be renamed

export type CogsUploadFileStatus =
  | 'idle'
  | 'uploading'
  | 'paused'
  | 'done'
  | 'error';

export interface WebkitFile extends File {
  webkitRelativePath?: string;
}

export type CogsFile = WebkitFile & CogsFileInfo;

export type CogsFileInfo = Pick<
  File,
  'name' | 'size' | 'type' | 'lastModified'
> & {
  uid: string;
  relativePath: string;
  percent: number;
  status: CogsUploadFileStatus;
};
