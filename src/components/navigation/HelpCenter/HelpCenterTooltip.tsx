import React from 'react';
import { HelpCenter, Icon } from '@cognite/cogs.js';
import useTranslation from 'hooks/useTranslation';
import useHelpCenter from 'hooks/useHelpCenter';

const HelpCenterTooltip = () => {
  const { t } = useTranslation('HelpCenterTooltip');
  const { isHelpCenterVisible, toggleHelpCenter } = useHelpCenter();

  return (
    <HelpCenter.StartUpTooltip
      appName="digital-cockpit"
      componentName="help-center"
      tooltipText={t(
        'tooltip-text',
        'Find relevant information in our new Help Center!'
      )}
      tooltipTitle={t('title', 'Need help?')}
      closeText={t('close-button', 'Got it')}
      isVisible={isHelpCenterVisible}
    >
      <Icon type="Help" onClick={toggleHelpCenter} />
    </HelpCenter.StartUpTooltip>
  );
};

export default HelpCenterTooltip;
