import React from 'react';
import { Helmet } from 'react-helmet';
import { getSidecar } from 'utils';
import { useTranslation } from 'react-i18next';

const TitleChanger = () => {
  const { applicationName, applicationId } = getSidecar();
  const { t } = useTranslation('Title');
  return (
    <Helmet>
      <title>
        {t(`app-name_${applicationId}_title`, {
          defaultValue: applicationName || applicationId,
        })}
      </title>
    </Helmet>
  );
};

export default TitleChanger;
