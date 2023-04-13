import { Col, Row } from 'antd';
import React, { useEffect, useState } from 'react';
import { makeDefaultTranslations } from 'utils/translations';

import { toast } from '@cognite/cogs.js';
import { v4 as uuidv4 } from 'uuid';

import { head } from 'lodash';
import { useUserInfo } from 'hooks/useUserInfo';
import { CogniteError } from '@cognite/sdk';
import { useSearchParam } from 'hooks/navigation';
import { MONITORING_SIDEBAR_HIGHLIGHTED_JOB } from 'utils/constants';
import { trackUsage, stopTimer } from 'services/metrics';
import { useCreateSessionNonce } from 'domain/chart';
import { FormTitle } from './elements';
import CreateMonitoringJobStep1 from './CreateMonitoringJobStep1';
import CreateMonitoringJobStep2 from './CreateMonitoringJobStep2';
import CreateMonitoringJobStep3 from './CreateMonitoringJobStep3';

import { useCreateMonitoringJob } from './hooks';
import {
  CreateMonitoringJobStates,
  CreateMonitoringJobFormData,
  CreateMonitoringJobPayload,
} from './types';
import { validateEmail } from './utils';

const defaultTranslations = makeDefaultTranslations(
  'Create monitoring job',
  'Start monitoring',
  'Cancel',
  'Next',
  'Back',
  'Unable to create Session Nonce',
  'Monitoring job created succesfully',
  'Unable to create monitoring job',
  'Notification email not found. Please ask your AD administrator to set it up for you.',
  'User ID not found'
);

type Props = {
  translations?: typeof defaultTranslations;
  onCancel: () => void;
};
const CreateMonitoringJob = ({ translations, onCancel }: Props) => {
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
    data: createMonitoringJobData,
    mutate: createMonitoringJob,
    isError: createMonitoringJobError,
    error: createMonitoringJobErrorData,
  } = useCreateMonitoringJob();

  const [step, setStep] = useState(1);
  const [nonce, setNonce] = useState('');
  const [formStatus, setFormStatus] =
    useState<CreateMonitoringJobStates>('READY');
  const [, setMonitoringJobIdParam] = useSearchParam(
    MONITORING_SIDEBAR_HIGHLIGHTED_JOB
  );

  const [steppedFormValues, setSteppedFormValues] =
    useState<CreateMonitoringJobFormData>({
      name: '',
      source: undefined,
      alertThreshold: 1,
      alertThresholdType: { label: 'Above', value: 'upper_threshold' },
      schedule: undefined,
      scheduleDurationType: { label: 'minutes', value: 'm' },
      minimumDuration: 1,
      folder: undefined,
      clientId: '',
      clientSecret: '',
      useCdfCredentials: true,
    } as CreateMonitoringJobFormData);

  const userInfo = useUserInfo();
  let notificationEmail = userInfo.data?.mail;
  if (notificationEmail === null) {
    // some users have an email as their displayName or givenName
    if (
      userInfo.data?.displayName &&
      validateEmail(userInfo.data.displayName)
    ) {
      notificationEmail = userInfo.data.displayName;
    }
    if (userInfo.data?.givenName && validateEmail(userInfo.data.givenName)) {
      notificationEmail = userInfo.data.givenName;
    }
  }
  const userAuthId = userInfo.data?.id;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  const onBack = (data: CreateMonitoringJobFormData) => {
    // Save the data from the corresponding step when the user goes back
    setSteppedFormValues(data);
    setStep(step - 1);
    trackUsage('Sidebar.Monitoring.BackToForm');
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

  const onNext = (data: CreateMonitoringJobFormData) => {
    const formData = { ...steppedFormValues, ...data };
    setSteppedFormValues(formData);
    if (step === 1) {
      setStep(step + 1);
      trackUsage('Sidebar.Monitoring.CompleteForm');
    } else if (step === 2) {
      onStartMonitoring(formData);
      stopTimer('Sidebar.Monitoring.CreateJob', {
        monitoringJobFormData: formData,
      });
    }
  };

  const onViewMonitoringJob = () => {
    onCancel();
    trackUsage('Sidebar.Monitoring.ViewMonitoringJob');
  };

  const transformName = (name: string) => {
    const generated = name.split(' ').join('_');
    return `${generated}`;
  };

  const sendDataToAPI = (createdNonce: string) => {
    const {
      schedule,
      source,
      name,
      alertThresholdType,
      folder,
      alertThreshold,
      minimumDuration,
    } = steppedFormValues;
    // @ts-ignore
    const scheduleCalc = Number(schedule.value);

    const activationInterval = `${minimumDuration}m`;

    if (
      source &&
      alertThresholdType &&
      notificationEmail &&
      folder &&
      userAuthId
    ) {
      const dataToSend: CreateMonitoringJobPayload = {
        monitoringTaskName: transformName(name),
        FolderId: folder.value,
        evaluateEvery: scheduleCalc,
        modelExternalId: alertThresholdType?.value,
        activationInterval,
        nonce: createdNonce,
        threshold: +alertThreshold,
        timeSeriesExternalId: source.tsExternalId!,
        userEmail: notificationEmail,
        subscriptionExternalId: uuidv4(),
        userAuthId,
      };
      createMonitoringJob(dataToSend);
      setFormStatus('NONCE_CREATED_DATA_SUBMITTED');
    } else if (!notificationEmail) {
      toast.error(
        t[
          'Notification email not found. Please ask your AD administrator to set it up for you.'
        ]
      );
      setFormStatus('READY');
    } else if (!userAuthId) {
      toast.error(t['User ID not found']);
      setFormStatus('READY');
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
      const job = head(createMonitoringJobData);
      if (job) {
        setMonitoringJobIdParam(`${job.id}`);
      }
      setStep(step + 1);
    }
    if (createMonitoringJobError) {
      const builtInMessage = t['Unable to create monitoring job'];
      try {
        const allErrors: CogniteError =
          createMonitoringJobErrorData as CogniteError;
        const messages = allErrors
          .toJSON()
          .message.errors.map((err: any) => err.message)
          .join(',');
        toast.error(`${builtInMessage} ${messages}`);
      } catch (error) {
        toast.error(`${builtInMessage}`);
      }
      setStep(step + 1);

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
          <CreateMonitoringJobStep3
            onViewMonitoringJob={onViewMonitoringJob}
            hasError={createMonitoringJobError}
            onBack={() => {
              setStep(step - 1);
            }}
          />
        )}
      </>
    );
  };

  return (
    <div style={{ position: 'relative', top: -20 }}>
      <FormTitle>
        <Row>
          <Col span={18}>{t['Create monitoring job']} </Col>
          <Col span={6} style={{ textAlign: 'right' }}>{`${step} / 2`}</Col>
        </Row>
      </FormTitle>

      {renderSteps()}

      <div id="monitoring-job-stepper">&nbsp;</div>
    </div>
  );
};

export default CreateMonitoringJob;
