import React, { useEffect, useState } from 'react';

import { useUserProfileQuery } from '@charts-app/common/providers/useUserProfileQuery';
import { useCreateSessionNonce } from '@charts-app/domain/chart';
import { useSearchParam } from '@charts-app/hooks/navigation';
import { useTranslations } from '@charts-app/hooks/translations';
import { useUserInfo } from '@charts-app/hooks/useUserInfo';
import { useChartAtom } from '@charts-app/models/chart/atom';
import { useScheduledCalculationDataValue } from '@charts-app/models/scheduled-calculation-results/atom';
import { trackUsage, stopTimer } from '@charts-app/services/metrics';
import {
  MONITORING_SIDEBAR_HIGHLIGHTED_JOB,
  MONITORING_SOURCE_CHART,
} from '@charts-app/utils/constants';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { Col, Row } from 'antd';
import { head } from 'lodash';

import { toast } from '@cognite/cogs.js';
import { CogniteError } from '@cognite/sdk';

import { FormTitle } from '../Common/SidebarElements';

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

const defaultTranslation = makeDefaultTranslations(
  'Create monitoring job',
  'Start monitoring',
  'Cancel',
  'Next',
  'Back',
  'Unable to create Session Nonce',
  'Monitoring job created succesfully',
  'Unable to create monitoring job',
  'Notification email not found. Please ask your AD administrator to set it up for you.',
  'User ID not found',
  'Subscribers not found'
);

type Props = {
  onCancel: () => void;
};
const CreateMonitoringJob = ({ onCancel }: Props) => {
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'MonitoringSidebar').t,
  };

  const { data: userProfile } = useUserProfileQuery();
  const [chart] = useChartAtom();

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

  const scCalcData = useScheduledCalculationDataValue();

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
      cdfCredsMode: 'USER_CREDS',
      subscribers: userProfile ? [userProfile] : [],
    });

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
  const userAuthId_deprecated = userInfo.data?.id;

  const onBack = (data: CreateMonitoringJobFormData) => {
    // Save the data from the corresponding step when the user goes back
    setSteppedFormValues(data);
    setStep(step - 1);
    trackUsage('Sidebar.Monitoring.BackToForm');
  };

  const onStartMonitoring = (formData: any) => {
    const currentValues = formData; // gets the latest formValues
    if (currentValues && currentValues.cdfCredsMode === 'USER_CREDS') {
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
      subscribers,
    } = steppedFormValues;
    const activationInterval = `${minimumDuration}m`;

    if (
      source &&
      alertThresholdType &&
      notificationEmail &&
      folder &&
      userAuthId_deprecated &&
      subscribers?.length
    ) {
      let tsExtId: string;

      if (
        source.type === 'scheduledCalculation' &&
        scCalcData &&
        scCalcData[source.id]
      ) {
        tsExtId = scCalcData[source.id].targetTimeseriesExternalId;
      } else if ('tsExternalId' in source) {
        tsExtId = source.tsExternalId!;
      }

      const dataToSend: CreateMonitoringJobPayload = {
        monitoringTaskName: transformName(name),
        FolderId: folder.value,
        evaluateEvery: Number(schedule?.value),
        modelExternalId: alertThresholdType?.value,
        activationInterval,
        nonce: createdNonce,
        threshold: +alertThreshold,
        timeSeriesExternalId: tsExtId!,
        subscribers: subscribers.map(({ userIdentifier, email }) => ({
          userIdentifier,
          email,
        })),
        userAuthId_deprecated,
        userEmail_deprecated: notificationEmail,
        sourceId: chart?.id || '',
        source: MONITORING_SOURCE_CHART,
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
    } else if (!subscribers?.length) {
      toast.error(t['Subscribers not found']);
      setFormStatus('READY');
    } else if (!userAuthId_deprecated) {
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
