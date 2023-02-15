import { Button, Icon, Tooltip } from '@cognite/cogs.js';
import { Col, Row } from 'antd';
import PortalWait from 'components/PortalWait/PortalWait';
import { debounce, head } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { makeDefaultTranslations } from 'utils/translations';
import CreateMonitoringJobFormError from './CreateMonitoringJobFormError';
import {
  ClientCredentialsWrapper,
  ClientCredentialsWrapperError,
  ClientCredentialsWrapperSuccess,
  Divider,
  DividerText,
  FieldTitleInfo,
  FullWidthButton,
  InfoBoxHeadingContainer,
  InfoBoxHeadingIconRed,
  InfoBoxHeadingIconSuccess,
  Line,
} from './elements';
import FormInputWithController from './FormInputWithController';
import { useCreateSessionNonce } from './hooks';
import { CreateMonitoringJobFormData } from './types';

const defaultTranslations = makeDefaultTranslations(
  'Use client credentials',
  'Client ID',
  'Example: 2340-234-234-456-5332',
  'Client secret',
  'Use CDF sign-in credentials',
  'Note! This may affect the stability of the monitoring job.',
  'Checking credentials...',
  'Client credentials are correct',
  'Client credentials you entered are incorrect or not valid. Please try again or contact with CDF administrator.',
  'Incorrect credentials',
  'Credentials verified',
  'Start monitoring',
  'Back'
);

type Props = {
  translations?: typeof defaultTranslations;
  isFormSubmitting: boolean;
  onNext: (data: any) => void;
  onBack: (data: CreateMonitoringJobFormData) => void;
  existingFormData: CreateMonitoringJobFormData;
};

type SessionCreationStatus = 'NONE' | 'CREATING' | 'CREATED' | 'ERROR';
const CreateMonitoringJobStep2 = ({
  translations,
  isFormSubmitting,
  onNext,
  onBack,
  existingFormData,
}: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };

  const { control, watch, formState, setValue } = useForm({
    mode: 'all',
    defaultValues: existingFormData,
  });
  const { isDirty, isValid, errors } = formState;
  const formValues = watch();

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

  const { useCdfCredentials, clientId, clientSecret } = formValues;

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
  }, [useCdfCredentials]);

  useEffect(() => {
    const nonceItem = head(sessionNonceResponse?.items);
    if (nonceItem) {
      setSessionStatus('CREATED');
    } else if (createSessionNonceError) {
      setSessionStatus('ERROR');
    }
  }, [sessionNonceResponse, createSessionNonceError]);

  const clientCredsValidated =
    useCdfCredentials === false ? sessionStatus === 'CREATED' : true;
  return (
    <div>
      <ClientCredentialsWrapper
        style={{ opacity: useCdfCredentials === false ? '0.5' : '1' }}
      >
        <Row>
          <Col span={2}>
            <FormInputWithController
              type="checkbox"
              control={control}
              name="useCdfCredentials"
            />
          </Col>
          <Col span={22}>
            <strong>{t['Use CDF sign-in credentials']}</strong>
            <div>
              {t['Note! This may affect the stability of the monitoring job.']}
            </div>
          </Col>
        </Row>
      </ClientCredentialsWrapper>
      <Divider>
        <Line />
        <DividerText>OR</DividerText>
      </Divider>
      <ClientCredentialsWrapper
        style={{ opacity: useCdfCredentials === true ? '0.5' : '1' }}
      >
        <strong>{t['Use client credentials']}</strong>

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
              formValues.useCdfCredentials === false ? value.length > 0 : true,
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
              formValues.useCdfCredentials === false ? value.length > 0 : true,
          }}
        />
      </ClientCredentialsWrapper>

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

      {isDirty && !isValid && <CreateMonitoringJobFormError errors={errors} />}

      <PortalWait elementId="monitoring-job-stepper">
        <Row>
          <Col span={8}>
            <Button
              onClick={() => {
                onBack(formValues);
              }}
            >
              {t.Back}
            </Button>
          </Col>
          <Col span={16}>
            <FullWidthButton
              disabled={!isValid || isFormSubmitting || !clientCredsValidated}
              type="primary"
              onClick={() => {
                onNext(formValues);
              }}
            >
              <AlarmIcon />
              {t['Start monitoring']}
              {isFormSubmitting && (
                <Icon type="Loader" style={{ marginLeft: '0.5em' }} />
              )}
            </FullWidthButton>
          </Col>
        </Row>
      </PortalWait>
    </div>
  );
};

const AlarmIcon = () => <Icon type="Alarm" style={{ marginRight: 8 }} />;

export default CreateMonitoringJobStep2;
