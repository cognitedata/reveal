import React from 'react';
import { useTranslation } from 'react-i18next';

import isEmpty from 'lodash/isEmpty';

import { ThreeDee } from 'components/3d-old';
import { BlankModal } from 'components/modal';
import { useSelectedFiles } from 'modules/seismicSearch/selectors';

import { ThreeDeeContainer } from './elements';

interface Props {
  onClose: () => void;
}
export const ThreeDeePreview: React.FC<Props> = ({ onClose }: Props) => {
  const { t } = useTranslation('WellData');

  const selectedFiles = useSelectedFiles();

  const fileId = !isEmpty(selectedFiles) ? selectedFiles[0].fileId : undefined;

  if (!fileId) return null;

  return (
    <BlankModal visible onCancel={onClose} title={t('3d preview')} fullWidth>
      <ThreeDeeContainer>
        {fileId && <ThreeDee fileId={fileId} />}
      </ThreeDeeContainer>
    </BlankModal>
  );
};
