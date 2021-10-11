import { useTranslation } from 'react-i18next';

import { DownloadButton } from 'components/buttons';
import { showInfoMessageWithTitle } from 'components/toast';
import { zipAndDownload } from 'modules/documentPreview/utils';
import { DocumentType } from 'modules/documentSearch/types';
import { RightAligned } from 'styles/layout';

import { DOWNLOAD_DOCUMENTS, DOWNLOAD_MESSAGE, DOWNLOADING } from './constants';

interface Props {
  data: DocumentType[];
}

export const DownloadInspected: React.FC<Props> = ({ data }) => {
  const { t } = useTranslation();

  const handleDownloadAll = async () => {
    showInfoMessageWithTitle(t(DOWNLOADING), t(DOWNLOAD_MESSAGE));
    await zipAndDownload(data);
  };

  return (
    <RightAligned>
      <DownloadButton
        type="secondary"
        text={DOWNLOAD_DOCUMENTS}
        iconPlacement="right"
        onClick={handleDownloadAll}
        data-testid="inspect-download-all"
      />
    </RightAligned>
  );
};
