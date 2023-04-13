import { makeDefaultTranslations } from 'utils/translations';
import { useMemo, useEffect, useState } from 'react';
import { trackUsage } from 'services/metrics';
import debounce from 'lodash/debounce';
import head from 'lodash/head';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'antd';
import { useCreateSessionNonce } from 'domain/chart';
import {
  ClientCredentialsWrapper,
  ClientCredentialsWrapperError,
  ClientCredentialsWrapperSuccess,
  Divider,
  DividerText,
  FieldTitleInfo,
  InfoBoxHeadingContainer,
  InfoBoxHeadingIconRed,
  InfoBoxHeadingIconSuccess,
  Line,
  ClientCredentialsDetails,
  ClientCredentialsOptionMessage,
} from 'components/Form/elements';
import { Tooltip } from '@cognite/cogs.js';
import { FormInputWithController } from '../Form/FormInputWithController';
import { FormError } from '../Form/FormError';

const defaultTranslations = makeDefaultTranslations(
  'Client ID',
  'Example: 2340-234-234-456-5332',
  'Client secret',
  'Use CDF sign-in credentials',
  'Checking credentials...',
  'Client credentials are correct',
  'Client credentials you entered are incorrect or not valid. Please try again or contact with CDF administrator.',
  'Incorrect credentials',
  'Credentials verified',
  'Use CDF Client ID and Client secret',
  'This option provides a more stable service'
);

/**
 * Fields:
      useCdfCredentials: boolean;
      clientSecret: string;
      clientId: string;
 */

type Props = {
  translations?: typeof defaultTranslations;
  onUpdateCredsValidated: (validted: boolean) => void;
};

type SessionCreationStatus = 'NONE' | 'CREATING' | 'CREATED' | 'ERROR';

export const CredentialsForm = ({
  translations,
  onUpdateCredsValidated,
}: Props) => {
  const { control, watch, formState, setValue } = useFormContext();
  const t = {
    ...defaultTranslations,
    ...translations,
  };
  const { isDirty, isValid, errors } = formState;
  const values = watch();

  const [sessionStatus, setSessionStatus] =
    useState<SessionCreationStatus>('NONE');
  const {
    data: sessionNonceResponse,
    mutate: createSessionNonce,
    isError: createSessionNonceError,
  } = useCreateSessionNonce();

  const checkCredentials = debounce((clientId, clientSecret) => {
    if (clientId !== '' && clientSecret !== '') {
      setSessionStatus('CREATING');
      createSessionNonce({
        items: [
          {
            clientId,
            clientSecret,
          },
        ],
      });
    }
  }, 1000);

  const { useCdfCredentials, clientId, clientSecret } = values;

  useMemo(() => {
    if (clientId !== '' || clientSecret !== '') {
      setValue('useCdfCredentials', false);
    }
    setSessionStatus('NONE');
    checkCredentials(clientId, clientSecret);
  }, [clientId, clientSecret]);

  useEffect(() => {
    if (useCdfCredentials === true) {
      setValue('clientId', '');
      setValue('clientSecret', '');
    }
    trackUsage('Sidebar.Monitoring.LoginMethod', {
      useCdfCredentials,
    });
  }, [useCdfCredentials]);

  useEffect(() => {
    const nonceItem = head(sessionNonceResponse?.items);
    if (nonceItem) {
      setSessionStatus('CREATED');
    } else if (createSessionNonceError) {
      setSessionStatus('ERROR');
    }
  }, [sessionNonceResponse, createSessionNonceError]);

  useEffect(() => {
    onUpdateCredsValidated(
      useCdfCredentials === false ? sessionStatus === 'CREATED' : true
    );
  }, [useCdfCredentials, sessionStatus]);

  return (
    <div>
      <ClientCredentialsWrapper>
        <Row>
          <Col span={2}>
            <FormInputWithController
              type="radio"
              control={control}
              name="useCdfCredentials"
              defaultValue
              id="useCdfCredentials1"
            />
          </Col>
          <Col span={22}>
            <strong>{t['Use CDF sign-in credentials']}</strong>
          </Col>
        </Row>
      </ClientCredentialsWrapper>
      <Divider>
        <Line />
        <DividerText>OR</DividerText>
      </Divider>
      <ClientCredentialsWrapper>
        <Row>
          <Col span={2}>
            <FormInputWithController
              type="radio"
              control={control}
              name="useCdfCredentials"
              defaultValue={false}
              id="useCdfCredentials2"
            />
          </Col>
          <Col span={22}>
            <strong>{t['Use CDF Client ID and Client secret']}</strong>
          </Col>
        </Row>
        <Row>
          <ClientCredentialsOptionMessage>
            {t['This option provides a more stable service']}
          </ClientCredentialsOptionMessage>
        </Row>
        <ClientCredentialsDetails
          style={{ display: useCdfCredentials === true ? 'none' : 'block' }}
        >
          <Tooltip content={t['Client ID']}>
            <FieldTitleInfo>{t['Client ID']}</FieldTitleInfo>
          </Tooltip>
          <FormInputWithController
            control={control}
            type="text"
            name="clientId"
            placeholder={t['Example: 2340-234-234-456-5332']}
            validate={{
              shouldBeSetIfNoCdfCreds: (value: string) =>
                useCdfCredentials === false ? value.length > 0 : true,
            }}
          />
          <Tooltip content={t['Client secret']}>
            <FieldTitleInfo>{t['Client secret']} </FieldTitleInfo>
          </Tooltip>
          <FormInputWithController
            control={control}
            type="text"
            name="clientSecret"
            placeholder={t['Example: 2340-234-234-456-5332']}
            validate={{
              shouldBeSetIfNoCdfCreds: (value: string) =>
                useCdfCredentials === false ? value.length > 0 : true,
            }}
          />

          {!useCdfCredentials && (
            <>
              {sessionStatus === 'CREATING' && (
                <ClientCredentialsWrapper>
                  {t['Checking credentials...']}
                </ClientCredentialsWrapper>
              )}
              {sessionStatus === 'CREATED' && (
                <ClientCredentialsWrapperSuccess>
                  <InfoBoxHeadingContainer>
                    <InfoBoxHeadingIconSuccess type="Checkmark" />
                    {t['Credentials verified']}
                  </InfoBoxHeadingContainer>
                  {t['Client credentials are correct']}
                </ClientCredentialsWrapperSuccess>
              )}
              {sessionStatus === 'ERROR' && (
                <ClientCredentialsWrapperError>
                  <InfoBoxHeadingContainer>
                    <InfoBoxHeadingIconRed type="ExclamationMark" />
                    {t['Incorrect credentials']}
                  </InfoBoxHeadingContainer>
                  {
                    t[
                      'Client credentials you entered are incorrect or not valid. Please try again or contact with CDF administrator.'
                    ]
                  }
                </ClientCredentialsWrapperError>
              )}
            </>
          )}
        </ClientCredentialsDetails>
      </ClientCredentialsWrapper>

      {isDirty && !isValid && <FormError errors={errors} />}
    </div>
  );
};
