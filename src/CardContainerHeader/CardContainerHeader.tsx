import React from 'react';
import { Title5, Colors } from '@cognite/cogs.js';
import { useTranslation } from 'react-i18next';
import { StyledHeading, CogniteMark } from 'styles/elements';
import { getSidecar } from 'utils';
import { StyledCardContainerHeader } from './elements';

const CardContainerHeader = () => {
  const { t } = useTranslation('TenantSelector');
  const { appName, applicationId } = getSidecar();
  return (
    <StyledCardContainerHeader>
      <Title5>
        {t('log-in-header', {
          defaultValue: 'Log in to:',
        })}
      </Title5>

      <StyledHeading className="name">
        {t(`app-name_${applicationId}`, { defaultValue: appName })}
      </StyledHeading>

      <CogniteMark color={Colors['yellow-4']} />
    </StyledCardContainerHeader>
  );
};

export default CardContainerHeader;
