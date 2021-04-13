import React from 'react';
import { HelpCenter as CogsHelpCenter } from '@cognite/cogs.js';
import useTranslation from 'hooks/useTranslation';
import { docList } from './utils';
import { HelpCenterBase } from './elements';

export type HelpCenterProps = {
  isVisible: boolean;
  onClose: () => void;
};

const HelpCenter = ({ isVisible, onClose }: HelpCenterProps) => {
  const { t } = useTranslation('HelpCenter');
  const documentation = docList.map(({ url, title, titleKey }) => ({
    url,
    title: t(titleKey, title),
  }));

  return (
    <HelpCenterBase>
      <CogsHelpCenter
        title={t('title', 'Help center')}
        isVisible={isVisible}
        onClose={() => onClose()}
        topBarHeight={56}
        rootCssSelector=".content"
        documentationTitle={t('documentation-title', 'Documentation')}
        documentation={documentation}
        privacyPolicyTitle={t('privacy-policy', 'Privacy policy')}
      />
    </HelpCenterBase>
  );
};

export default HelpCenter;
