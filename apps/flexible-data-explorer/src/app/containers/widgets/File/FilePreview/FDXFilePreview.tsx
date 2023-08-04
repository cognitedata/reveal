import { FilePreview } from './FilePreview';

const UFV_APPLICATION_ID = 'FDX';

export const FDXFilePreview: React.FC<{
  fileId: number | string;
  id?: string;
  showControls?: boolean;
}> = ({ fileId, id, showControls }) => {
  return (
    <FilePreview
      key={fileId}
      id={`${UFV_APPLICATION_ID}-${fileId}-${id}`}
      applicationId={UFV_APPLICATION_ID}
      fileId={fileId}
      creatable={false}
      contextualization={false}
      showControls={showControls}
    />
  );
};
