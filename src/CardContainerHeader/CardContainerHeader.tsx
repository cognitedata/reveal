import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyledHeading, CogniteMark } from 'styles/elements';
import { getSidecar } from 'utils';
import { StyledCardContainerHeader } from './elements';

const CardContainerHeader = () => {
  const { t } = useTranslation('TenantSelector');
  const { appName, applicationId } = getSidecar();
  return (
    <StyledCardContainerHeader>
      <h3 className="cogs-title-5">
        {t('log-in-header', {
          defaultValue: 'Log in to:',
        })}
      </h3>

      <StyledHeading className="name">
        {t(`app-name_${applicationId}`, { defaultValue: appName })}
      </StyledHeading>

      <CogniteMark color="var(--cogs-yellow-4)" />
    </StyledCardContainerHeader>
  );
};

export default CardContainerHeader;
