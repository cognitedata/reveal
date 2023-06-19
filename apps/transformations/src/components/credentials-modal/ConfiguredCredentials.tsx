import { useTranslation } from '@transformations/common';
import { StyledCredentialsFormSectionContainer } from '@transformations/components/credentials-form';
import { useSession } from '@transformations/hooks/sessions';
import { TransformationRead } from '@transformations/types';

import { Body, Flex } from '@cognite/cogs.js';

type ConfiguredCredentialsProps = {
  transformation: TransformationRead;
};

const ConfiguredCredentials = ({
  transformation,
}: ConfiguredCredentialsProps): JSX.Element => {
  const { t } = useTranslation();

  const {
    destinationSession,
    hasDestinationApiKey,
    hasDestinationOidcCredentials,
    hasSourceApiKey,
    hasSourceOidcCredentials,
    sourceSession,
  } = transformation;

  const hasApiKey = hasSourceApiKey && hasDestinationApiKey;
  const hasOidcCredentials =
    hasSourceOidcCredentials && hasDestinationOidcCredentials;
  const hasSession = !!sourceSession && !!destinationSession;

  const { data: sourceSessionData } = useSession(
    {
      id: sourceSession?.sessionId!,
      project: sourceSession?.projectName!,
    },
    {
      enabled: hasSession,
    }
  );
  const { data: destinationSessionData } = useSession(
    {
      id: destinationSession?.sessionId!,
      project: destinationSession?.projectName!,
    },
    {
      enabled: hasSession,
    }
  );

  if (hasApiKey || hasOidcCredentials) {
    return (
      <Flex direction="column" gap={8}>
        <Body level={2} strong>
          {t('read-and-write-credentials')}
        </Body>
        <StyledCredentialsFormSectionContainer>
          {t('credentials-cannot-be-displayed')}
        </StyledCredentialsFormSectionContainer>
      </Flex>
    );
  }

  if (hasSession) {
    return (
      <>
        {sourceSessionData?.clientId === destinationSessionData?.clientId &&
        sourceSession.projectName === destinationSession.projectName ? (
          <Flex direction="column" gap={8}>
            <Body level={2} strong>
              {t('read-and-write-credentials')}
            </Body>
            <StyledCredentialsFormSectionContainer>
              <Flex direction="column">
                <Body level={2} strong>
                  {t('client-id')}
                </Body>
                <Body level={2}>{sourceSessionData?.clientId}</Body>
              </Flex>
              <Flex direction="column">
                <Body level={2} strong>
                  {t('project')}
                </Body>
                <Body level={2}>{sourceSession.projectName}</Body>
              </Flex>
            </StyledCredentialsFormSectionContainer>
          </Flex>
        ) : (
          <Flex direction="column" gap={16}>
            <Flex direction="column" gap={8}>
              <Body level={2} strong>
                {t('read-credentials')}
              </Body>
              <StyledCredentialsFormSectionContainer>
                <Flex direction="column">
                  <Body level={2} strong>
                    {t('client-id')}
                  </Body>
                  <Body level={2}>{sourceSessionData?.clientId}</Body>
                </Flex>
                <Flex direction="column">
                  <Body level={2} strong>
                    {t('project')}
                  </Body>
                  <Body level={2}>{sourceSession.projectName}</Body>
                </Flex>
              </StyledCredentialsFormSectionContainer>
            </Flex>
            <Flex direction="column" gap={8}>
              <Body level={2} strong>
                {t('write-credentials')}
              </Body>
              <StyledCredentialsFormSectionContainer>
                <Flex direction="column">
                  <Body level={2} strong>
                    {t('client-id')}
                  </Body>
                  <Body level={2}>{destinationSessionData?.clientId}</Body>
                </Flex>
                <Flex direction="column">
                  <Body level={2} strong>
                    {t('project')}
                  </Body>
                  <Body level={2}>{destinationSession.projectName}</Body>
                </Flex>
              </StyledCredentialsFormSectionContainer>
            </Flex>
          </Flex>
        )}
      </>
    );
  }

  return <></>;
};

export default ConfiguredCredentials;
