import { FDXFilePreview } from '../../../widgets/File/FilePreview';

import { PreviewContainer } from './elements';

interface Props {
  id: string | number;
}
export const FileViewer: React.FC<Props> = ({ id }) => {
  return (
    <PreviewContainer>
      <FDXFilePreview fileId={id} showControls={false} />
    </PreviewContainer>
  );
};
