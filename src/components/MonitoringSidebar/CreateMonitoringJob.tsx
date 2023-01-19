import { Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { makeDefaultTranslations } from 'utils/translations';

import { toast } from '@cognite/cogs.js';
import { v4 as uuidv4 } from 'uuid';

import { head } from 'lodash';
import { useUserInfo } from 'hooks/useUserInfo';
import { CogniteError } from '@cognite/sdk';
import { FormTitle } from './elements';
import CreateMonitoringJobStep1 from './CreateMonitoringJobStep1';
import CreateMonitoringJobStep2 from './CreateMonitoringJobStep2';
import CreateMonitoringJobStep3 from './CreateMonitoringJobStep3';

import { useCreateMonitoringJob, useCreateSessionNonce } from './hooks';
import {
  CreateMonitoringJobStates,
  CreateMonitoringTaskFormData,
  CreateMonitoringTaskPayload,
} from './types';

const defaultTranslations = makeDefaultTranslations(
  'New monitoring job',
  'Start monitoring',
  'Cancel',
  'Next',
  'Back',
  'Unable to create Session Nonce',
  'Monitoring job created succesfully',
  'Unable to create monitoring job'
);

type Props = {
  translations?: typeof defaultTranslations;
  onCancel: () => void;
  onViewMonitoringJob: () => void;
};
const CreateMonitoringJob = ({
  translations,
  onCancel,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  onViewMonitoringJob,
}: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };

  const {
    data: sessionNonceResponse,
    mutate: createSessionNonce,
    isError: createSessionNonceError,
  } = useCreateSessionNonce();

  const {
    isSuccess: createMonitoringJobSuccess,
    data: _createMonitoringJobData,
    mutate: createMonitoringJob,
    isError: createMonitoringJobError,
    error: createMonitoringJobErrorData,
  } = useCreateMonitoringJob();

  const [step, setStep] = useState(1);
  const [nonce, setNonce] = useState('');
  const [formStatus, setFormStatus] =
    useState<CreateMonitoringJobStates>('READY');

  const [steppedFormValues, setSteppedFormValues] =
    useState<CreateMonitoringTaskFormData>({
      name: '',
      source: undefined,
      alertThreshold: 1,
      alertThresholdType: { label: 'Is above', value: 'threshold' },
      evaluateEveryType: { label: 'minutes', value: 'minutes' },
      evaluateEvery: 10,
      minimumDurationType: { label: 'minutes', value: 'm' },
      minimumDuration: 1,
      folder: undefined,
      clientId: '',
      clientSecret: '',
      useCdfCredentials: true,
    } as CreateMonitoringTaskFormData);

  const userInfo = useUserInfo();
  const notificationEmail = userInfo.data?.mail;
  const userAuthId = userInfo.data?.id;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  const onBack = (data: CreateMonitoringTaskFormData) => {
    // Save the data from the corresponding step when the user goes back
    setSteppedFormValues(data);
    setStep(step - 1);
  };

  const onStartMonitoring = (formData: any) => {
    const currentValues = formData; // gets the latest formValues
    if (currentValues && currentValues.useCdfCredentials) {
      createSessionNonce({
        items: [
          {
            tokenExchange: true,
          },
        ],
      });
    } else if (currentValues)
      createSessionNonce({
        items: [
          {
            clientId: currentValues.clientId,
            clientSecret: currentValues.clientSecret,
          },
        ],
      });
    setFormStatus('NONCE_CREATING');
  };

  const onNext = (data: CreateMonitoringTaskFormData) => {
    const formData = { ...steppedFormValues, ...data };
    setSteppedFormValues(formData);
    if (step === 1) {
      setStep(step + 1);
    } else if (step === 2) {
      onStartMonitoring(formData);
    }
  };

  const getTimeFactor = (from: string) => {
    switch (from) {
      case 'minutes':
        return 60;
      case 'hours':
        return 3600;
    }
    return 1;
  };

  const sendDataToAPI = (createdNonce: string) => {
    const {
      evaluateEvery,
      evaluateEveryType,
      source,
      name,
      alertThresholdType,
      folder,
      alertThreshold,
      minimumDuration,
      minimumDurationType,
    } = steppedFormValues;

    const evaluateEveryCalc =
      evaluateEvery * getTimeFactor(evaluateEveryType?.value || '') * 1000;

    const granularity = `${minimumDuration}${minimumDurationType?.value}`;

    if (
      source &&
      alertThresholdType &&
      notificationEmail &&
      folder &&
      userAuthId
    ) {
      const dataToSend: CreateMonitoringTaskPayload = {
        monitoringTaskExternalID: name,
        FolderId: folder.value,
        evaluateEvery: evaluateEveryCalc,
        modelExternalId: alertThresholdType?.value,
        granularity,
        nonce: createdNonce,
        threshold: alertThreshold,
        timeseriesExternalId: source?.value,
        userEmail: notificationEmail,
        subscriptionExternalId: uuidv4(),
        userAuthId,
      };
      createMonitoringJob(dataToSend);
      setFormStatus('NONCE_CREATED_DATA_SUBMITTED');
    }
  };

  useEffect(() => {
    if (createSessionNonceError) {
      toast.error(t['Unable to create Session Nonce'], {
        toastId: 'create-monitoring-job-session-create-error',
      });
    } else {
      const nonceItem = head(sessionNonceResponse?.items);
      if (nonceItem) {
        setNonce(nonceItem.nonce);
        setFormStatus('NONCE_CREATED');
      }
    }
  }, [sessionNonceResponse, createSessionNonceError]);

  useEffect(() => {
    switch (formStatus) {
      case 'NONCE_CREATED':
        sendDataToAPI(nonce);
        break;
    }
  }, [formStatus, nonce]);

  useEffect(() => {
    if (createMonitoringJobSuccess) {
      toast.success(t['Monitoring job created succesfully']);
      setStep(step + 1);
    }
    if (createMonitoringJobError) {
      const allErrors: CogniteError =
        createMonitoringJobErrorData as CogniteError;
      const messages = allErrors
        .toJSON()
        .message.errors.map((err: any) => err.message)
        .join(',');
      const builtInMessage = t['Unable to create monitoring job'];
      toast.error(`${builtInMessage} ${messages}`);
      setFormStatus('READY');
    }
  }, [
    createMonitoringJobError,
    createMonitoringJobSuccess,
    createMonitoringJobErrorData,
  ]);

  const formDataProcessing = [
    'NONCE_CREATING',
    'NONCE_CREATED_DATA_SUBMITTED',
    'NONCE_CREATED',
  ].includes(formStatus);

  const renderSteps = (): JSX.Element => {
    return (
      <>
        {step === 1 && (
          <CreateMonitoringJobStep1
            existingFormData={steppedFormValues}
            onCancel={onCancel}
            onNext={onNext}
          />
        )}
        {step === 2 && (
          <CreateMonitoringJobStep2
            existingFormData={steppedFormValues}
            onBack={onBack}
            onNext={onNext}
            isFormSubmitting={formDataProcessing}
          />
        )}
        {step === 3 && (
          <CreateMonitoringJobStep3 onViewMonitoringJob={onViewMonitoringJob} />
        )}
      </>
    );
  };

  return (
    <div style={{ position: 'relative', top: -20 }}>
      <FormTitle>
        <Row>
          <Col span={21}>{t['New monitoring job']} </Col>
          <Col span={3}>{`${step} / 2`}</Col>
        </Row>
      </FormTitle>

      {renderSteps()}

      <div id="monitoring-job-stepper">&nbsp;</div>
    </div>
  );
};

export default CreateMonitoringJob;
