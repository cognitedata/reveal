import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import { CredentialsForm } from '@charts-app/components/CredentialsForm/CredentialsForm';
import PortalWait from '@charts-app/components/PortalWait/PortalWait';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { Col, Row } from 'antd';

import { Button, Icon } from '@cognite/cogs.js';

import { FullWidthButton } from './elements';
import { CreateMonitoringJobFormData } from './types';

const defaultTranslations = makeDefaultTranslations('Start monitoring', 'Back');

type Props = {
  translations?: typeof defaultTranslations;
  isFormSubmitting: boolean;
  onNext: (data: any) => void;
  onBack: (data: CreateMonitoringJobFormData) => void;
  existingFormData: CreateMonitoringJobFormData;
};

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
