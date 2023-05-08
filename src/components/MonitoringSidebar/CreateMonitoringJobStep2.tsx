import { useState } from 'react';
import { Button, Icon } from '@cognite/cogs.js';
import { Col, Row } from 'antd';
import PortalWait from 'components/PortalWait/PortalWait';
import { useForm, FormProvider } from 'react-hook-form';
import { makeDefaultTranslations } from 'utils/translations';
import { CredentialsForm } from 'components/CredentialsForm/CredentialsForm';
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
              <Icon type="ArrowLeft" style={{ marginRight: 8 }} />

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

// @ts-ignore
const AlarmIcon = () => <Icon type="Alarm" style={{ marginRight: 8 }} />;

export default CreateMonitoringJobStep2;
