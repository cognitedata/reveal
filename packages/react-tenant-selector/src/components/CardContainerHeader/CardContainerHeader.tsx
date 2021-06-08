import { useTranslation } from '@cognite/react-i18n';

import { StyledHeading, CogniteMark } from '../../styles/elements';

import { StyledCardContainerHeader } from './elements';

const CardContainerHeader = ({
  applicationName,
  applicationId,
}: {
  applicationName: string;
  applicationId: string;
}) => {
  const { t } = useTranslation('TenantSelector');
  return (
    <StyledCardContainerHeader>
      <h3 className="cogs-title-5">
        {t('log-in-header', {
          defaultValue: 'Log in to:',
        })}
      </h3>

      <StyledHeading className="name">
        {t(`app-name_${applicationId}`, {
          defaultValue: applicationName || applicationId,
        })}
      </StyledHeading>

      <CogniteMark color="var(--cogs-yellow-4)" />
    </StyledCardContainerHeader>
  );
};

export default CardContainerHeader;
