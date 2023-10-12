import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { Col, Row } from 'antd';

import { Button, Icon } from '@cognite/cogs.js';

import { useTranslations } from '../../hooks/translations';
import { makeDefaultTranslations } from '../../utils/translations';
import { CredentialsForm } from '../CredentialsForm/CredentialsForm';
import PortalWait from '../PortalWait/PortalWait';

import { FullWidthButton } from './elements';
import { CreateMonitoringJobFormData } from './types';

const defaultTranslation = makeDefaultTranslations('Start monitoring', 'Back');

type Props = {
  isFormSubmitting: boolean;
  onNext: (data: any) => void;
  onBack: (data: CreateMonitoringJobFormData) => void;
  existingFormData: CreateMonitoringJobFormData;
};

const CreateMonitoringJobStep2 = ({
  isFormSubmitting,
  onNext,
  onBack,
  existingFormData,
}: Props) => {
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'MonitoringSidebar').t,
  };

  const formMethods = useForm({
    mode: 'all',
    defaultValues: existingFormData,
  });
  const { watch, formState } = formMethods;
  const { isValid } = formState;
  const formValues = watch();
  const [clientCredsValidated, setClientCredsValidated] =
    useState<boolean>(false);

  return (
    <div>
      <FormProvider {...formMethods}>
        <CredentialsForm
          onUpdateCredsValidated={setClientCredsValidated}
          uniqueFormId="monitoring"
          trackingId="Sidebar.Monitoring.LoginMethod"
        />
      </FormProvider>

      <PortalWait elementId="monitoring-job-stepper">
        <Row>
          <Col span={8}>
            <Button
              onClick={() => {
                onBack(formValues);
              }}
            >
              <Icon type="ArrowLeft" css={{ marginRight: 8 }} /> {t.Back}
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
                <Icon type="Loader" css={{ marginLeft: '0.5em' }} />
              )}
            </FullWidthButton>
          </Col>
        </Row>
      </PortalWait>
    </div>
  );
};

const AlarmIcon = () => <Icon type="Alarm" css={{ marginRight: 8 }} />;

export default CreateMonitoringJobStep2;
