export type FileDownloaderModalProps = {
  fileIds: number[];
  showModal: boolean;
  onCancel: () => void;
};

export enum AnnotationFileFormat {
  CSV = 'CSV (Google Vertex AI)',
  TXT = 'TXT (YOLO Darknet)',
  XML = 'XML (Pascal VOC)',
}
export enum AnnotationChoice {
  VerifiedAndUnreviewed = 'Only verified and unreviewed annotations',
  OnlyRejected = 'Only rejected annotations',
  All = 'All annotations (including rejected)',
}
export enum DownloadChoice {
  Files = 'Files only',
  Annotations = 'Annotations only',
  FilesAndAnnotations = 'Files and annotations',
}
