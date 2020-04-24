import React from 'react';
import { Helmet } from 'react-helmet';
import { getSidecar } from 'utils';
import { useTranslation } from 'react-i18next';

const TitleChanger = () => {
  const { appName, applicationId } = getSidecar();
  const { t } = useTranslation('Title');
  return (
    <Helmet>
      <title>
        {t(`app-name_${applicationId}_title`, { defaultValue: appName })}
      </title>
    </Helmet>
  );
};

export default TitleChanger;
