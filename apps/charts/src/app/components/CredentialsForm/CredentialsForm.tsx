import { useMemo, useEffect, useState } from 'react';
import { useFormContext, Path, PathValue } from 'react-hook-form';

import debounce from 'lodash/debounce';
import head from 'lodash/head';

import { Tooltip, Flex } from '@cognite/cogs.js';

import { useCreateSessionNonce } from '../../domain/chart';
import { useTranslations } from '../../hooks/translations';
import { trackUsage } from '../../services/metrics';
import { makeDefaultTranslations } from '../../utils/translations';
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
} from '../Form/elements';
import { FormError } from '../Form/FormError';
import { FormInputWithController } from '../Form/FormInputWithController';

const defaultTranslation = makeDefaultTranslations(
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

type Props = {
  onUpdateCredsValidated: (validted: boolean) => void;
  uniqueFormId: string;
  trackingId?: string;
};

type CredentialsFormValues = {
  cdfCredsMode: 'USER_CREDS' | 'CLIENT_SECRET';
  clientId: string;
  clientSecret: string;
};

type SessionCreationStatus = 'NONE' | 'CREATING' | 'CREATED' | 'ERROR';

export const CredentialsForm = <TFieldValues extends CredentialsFormValues>({
  onUpdateCredsValidated,
  uniqueFormId,
  trackingId = 'CredentialsForm.LoginMethod',
}: Props) => {
  const { control, watch, formState, setValue } =
    useFormContext<TFieldValues>();
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'CredentialForm').t,
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

  const { cdfCredsMode, clientId, clientSecret } = values;

  useMemo(() => {
    if (clientId !== '' || clientSecret !== '') {
      setValue(
        'cdfCredsMode' as Path<TFieldValues>,
        'CLIENT_SECRET' as PathValue<TFieldValues, Path<TFieldValues>>
      );
    }
    setSessionStatus('NONE');
    checkCredentials(clientId, clientSecret);
  }, [clientId, clientSecret]);

  useEffect(() => {
    if (cdfCredsMode === 'USER_CREDS') {
      setValue(
        'clientId' as Path<TFieldValues>,
        '' as PathValue<TFieldValues, Path<TFieldValues>>
      );
      setValue(
        'clientSecret' as Path<TFieldValues>,
        '' as PathValue<TFieldValues, Path<TFieldValues>>
      );
    }
    trackUsage(trackingId, {
      cdfCredsMode,
    });
  }, [cdfCredsMode]);

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
      cdfCredsMode === 'CLIENT_SECRET' ? sessionStatus === 'CREATED' : true
    );
  }, [cdfCredsMode, sessionStatus]);

  return (
    <div>
      <ClientCredentialsWrapper>
        <Flex gap={4}>
          <FormInputWithController
            type="radio"
            control={control}
            name="cdfCredsMode"
            id={`userCredentials-${uniqueFormId}`}
            radioValue="USER_CREDS"
            key={`userCredentials-${uniqueFormId}`}
            label={t['Use CDF sign-in credentials']}
          />
        </Flex>
      </ClientCredentialsWrapper>
      <Divider>
        <Line />
        <DividerText>OR</DividerText>
      </Divider>
      <ClientCredentialsWrapper>
        <Flex gap={2}>
          <FormInputWithController
            type="radio"
            control={control}
            name="cdfCredsMode"
            id={`clientSecret-${uniqueFormId}`}
            radioValue="CLIENT_SECRET"
            key={`clientSecret-${uniqueFormId}`}
            label={t['Use CDF Client ID and Client secret']}
          />
        </Flex>
        <ClientCredentialsOptionMessage>
          {t['This option provides a more stable service']}
        </ClientCredentialsOptionMessage>
        <ClientCredentialsDetails
          style={{ display: cdfCredsMode === 'USER_CREDS' ? 'none' : 'block' }}
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
                cdfCredsMode === 'CLIENT_SECRET' ? value.length > 0 : true,
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
                cdfCredsMode === 'CLIENT_SECRET' ? value.length > 0 : true,
            }}
          />

          {cdfCredsMode === 'CLIENT_SECRET' && (
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

      {isDirty && !isValid && <FormError<TFieldValues> errors={errors} />}
    </div>
  );
};
