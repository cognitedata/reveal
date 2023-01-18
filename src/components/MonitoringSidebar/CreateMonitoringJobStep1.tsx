import React, { useEffect } from 'react';
import { makeDefaultTranslations } from 'utils/translations';
import { useUserInfo } from 'hooks/useUserInfo';
import { Button, Icon, Row, Col } from '@cognite/cogs.js';
import MonitoringFolderSelect from 'components/MonitoringFolderSelect/MonitoringFolderSelect';
import { useChartAtom } from 'models/chart/atom';
import { useForm } from 'react-hook-form';
import { delay } from 'lodash';
import PortalWait from 'components/PortalWait/PortalWait';
import {
  FieldHelperText,
  NotificationBox,
  NotificationEmail,
  FieldTitleRequired,
  FullWidthButton,
} from './elements';
import FormInputWithController from './FormInputWithController';
import { CreateMonitoringTaskFormData } from './types';
import CreateMonitoringJobFormError from './CreateMonitoringJobFormError';

const defaultTranslations = makeDefaultTranslations(
  'Name your monitoring job',
  'Name of the job',
  'Source',
  'Alert when threshold',
  'Is above',
  'Is below',
  'Minimum duration',
  'Avoid alert flooding by setting a minimum period e.g. 5min',
  'Evaluate every',
  'How often your alerts will be evaluated',
  'Save to',
  'Notifications will be sent to :',
  'Cancel',
  'Next',
  'Alert threshold is required',
  'Name of the job is required',
  'Source is required',
  'Minimum duration is required',
  '"Evaluate Every" is required',
  'Cancel',
  'Next'
);

type Props = {
  translations?: typeof defaultTranslations;
  onCancel: () => void;
  onNext: (data: any) => void;
  existingFormData: CreateMonitoringTaskFormData;
};
const CreateMonitoringJobStep1 = ({
  translations,
  onCancel,
  onNext,
  existingFormData,
}: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };
  const { control, watch, formState, trigger } = useForm({
    mode: 'all',
    defaultValues: existingFormData,
  });

  const { isDirty, isValid, errors } = formState;

  const [chart] = useChartAtom();
  const timeseries = (chart && chart?.timeSeriesCollection) || [];
  const durationSelectOptions = [
    {
      label: 'minutes',
      value: 'minutes',
    },
    {
      label: 'hours',
      value: 'hours',
    },
  ];
  const userInfo = useUserInfo();
  const notificationEmail = userInfo.data?.mail;
  const formValues = watch();

  useEffect(() => {
    delay(trigger, 1000);
  }, [JSON.stringify(formValues)]);

  return (
    <form>
      <FieldTitleRequired>{t['Name of the job']} </FieldTitleRequired>
      <FormInputWithController
        control={control}
        type="text"
        name="name"
        required={t['Name of the job is required']}
      />

      <FieldTitleRequired>{t.Source}</FieldTitleRequired>
      <FormInputWithController
        control={control}
        type="timeseries"
        name="source"
        options={timeseries.map((ts) => ({
          label: ts.name,
          value: ts.tsExternalId,
          color: ts.color,
        }))}
        required={t['Source is required']}
      />

      <FieldTitleRequired>{t['Alert when threshold']} </FieldTitleRequired>
      <Row>
        <Col span={13}>
          <FormInputWithController
            control={control}
            type="select"
            name="alertThresholdType"
            required={`"Alert when" is required`}
            options={[
              {
                label: t['Is above'],
                value: 'threshold',
              },
              {
                label: t['Is below'],
                value: 'lower-threshold',
              },
            ]}
          />
        </Col>
        <Col span={1}>&nbsp;</Col>
        <Col span={10}>
          <FormInputWithController
            control={control}
            type="number"
            name="alertThreshold"
            fullWidth
            required={t['Alert threshold is required']}
          />
        </Col>
      </Row>

      <FieldTitleRequired>{t['Minimum duration']} </FieldTitleRequired>
      <Row>
        <Col span={13}>
          <FormInputWithController
            control={control}
            type="number"
            name="minimumDuration"
            placeholder="1"
            fullWidth
            required={t['Minimum duration is required']}
          />
        </Col>
        <Col span={1}>&nbsp;</Col>
        <Col span={10}>
          <FormInputWithController
            control={control}
            type="select"
            name="minimumDurationType"
            required={t['Minimum duration is required']}
            options={[
              {
                label: 'minutes',
                value: 'm',
              },
              {
                label: 'seconds',
                value: 's',
              },
            ]}
          />
        </Col>
        <FieldHelperText>
          {t['Avoid alert flooding by setting a minimum period e.g. 5min']}
        </FieldHelperText>
      </Row>

      <FieldTitleRequired>{t['Evaluate every']} </FieldTitleRequired>
      <Row>
        <Col span={13}>
          <FormInputWithController
            control={control}
            type="number"
            name="evaluateEvery"
            placeholder="10"
            required={t['"Evaluate Every" is required']}
          />
        </Col>
        <Col span={1}>&nbsp;</Col>
        <Col span={10}>
          <FormInputWithController
            control={control}
            type="select"
            name="evaluateEveryType"
            required={t['"Evaluate Every" is required']}
            options={durationSelectOptions}
          />
        </Col>
        <FieldHelperText>
          {t['How often your alerts will be evaluated']}
        </FieldHelperText>
      </Row>

      <FieldTitleRequired>{t['Save to']} </FieldTitleRequired>
      <MonitoringFolderSelect control={control} inputName="folder" />

      <NotificationBox>
        {t['Notifications will be sent to :']}
        <NotificationEmail>{notificationEmail}</NotificationEmail>
      </NotificationBox>

      {isDirty && !isValid && <CreateMonitoringJobFormError errors={errors} />}

      <PortalWait elementId="monitoring-job-stepper">
        <Row>
          <Col span={8}>
            <Button onClick={onCancel}>{t.Cancel}</Button>
          </Col>
          <Col span={16}>
            <FullWidthButton
              disabled={!isValid}
              type="primary"
              onClick={() => {
                onNext(formValues);
              }}
            >
              {t.Next}
              <Icon type="ArrowRight" style={{ marginLeft: 8 }} />
            </FullWidthButton>
          </Col>
        </Row>
      </PortalWait>
    </form>
  );
};

export default CreateMonitoringJobStep1;
