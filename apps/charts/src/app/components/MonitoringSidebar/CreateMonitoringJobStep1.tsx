import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  FieldHelperText,
  FieldTitleRequired,
} from '@charts-app/components/Form/elements';
import MonitoringFolderSelect from '@charts-app/components/MonitoringFolderSelect/MonitoringFolderSelect';
import PortalWait from '@charts-app/components/PortalWait/PortalWait';
import {
  SCHEDULE_MINUTE_OPTIONS,
  SCHEDULE_HOUR_OPTIONS,
  MONITORING_THRESHOLD_ID,
  MINIMUM_DURATION_LIMIT,
} from '@charts-app/domain/monitoring/constants';
import { useTranslations } from '@charts-app/hooks/translations';
import { useChartAtom } from '@charts-app/models/chart/atom';
import {
  ChartThreshold,
  ChartTimeSeries,
} from '@charts-app/models/chart/types';
import {
  addChartThreshold,
  removeChartThreshold,
  updateChartThresholdSelectedSource,
  updateChartThresholdUpperLimit,
} from '@charts-app/models/chart/updates-threshold';
import { useChartInteractionsAtom } from '@charts-app/models/interactions/atom';
import { trackUsage } from '@charts-app/services/metrics';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { delay } from 'lodash';

import { Button, Icon, Row, Col, Chip } from '@cognite/cogs.js';

import { FormError } from '../Form/FormError';
import { FormInputWithController } from '../Form/FormInputWithController';

import { FullWidthButton } from './elements';
import { SubscribeJob } from './SubscribeJob';
import { CreateMonitoringJobFormData } from './types';

const defaultTranslation = makeDefaultTranslations(
  'Name',
  'Source',
  'Describe monitoring job',
  'Alert when threshold is',
  'Above',
  'Below',
  'Minimum duration',
  'Minutes',
  'Set a minimum duration to avoid alert flooding',
  'Schedule',
  'How often the monitoring job runs',
  'Save to',
  'Notifications will be sent to: ',
  'Cancel',
  'Next',
  'Alert threshold is required',
  'Name is required',
  'Source is required',
  'Minimum duration is required',
  'Schedule is required',
  'Cancel',
  'Next'
);

type Props = {
  onCancel: () => void;
  onNext: (data: any) => void;
  existingFormData: CreateMonitoringJobFormData;
};
const CreateMonitoringJobStep1 = ({
  onCancel,
  onNext,
  existingFormData,
}: Props) => {
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'MonitoringSidebar').t,
  };

  const { control, watch, formState, trigger, setValue } =
    useForm<CreateMonitoringJobFormData>({
      mode: 'all',
      defaultValues: existingFormData,
    });

  const { isDirty, isValid, errors } = formState;

  const [chart, setChart] = useChartAtom();
  const [, setInteractionsState] = useChartInteractionsAtom();
  const timeseries = (chart && chart?.timeSeriesCollection) || [];

  const formValues = watch();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const scheduleDurationType = watch('scheduleDurationType');

  useEffect(() => {
    delay(trigger, 1000);
  }, [JSON.stringify(formValues), trigger]);

  const hasMonitoringThreshold = Boolean(
    chart?.thresholdCollection?.find(
      (threshold) => threshold.id === MONITORING_THRESHOLD_ID
    )
  );

  const handleCancel = () => {
    trackUsage('Sidebar.Monitoring.CancelCreate');
    onCancel();
  };

  useEffect(() => {
    const thresholdData = {
      id: MONITORING_THRESHOLD_ID,
      name: `monitoring-threshold`,
      visible: true,
      upperLimit: 0,
      type: 'under',
      filter: {},
    } as ChartThreshold;

    if (!hasMonitoringThreshold) {
      setChart((oldChart) => addChartThreshold(oldChart!, thresholdData));
    }
  }, [hasMonitoringThreshold, setChart]);

  useEffect(() => {
    return () => {
      setTimeout(() => {
        setChart((oldChart) =>
          removeChartThreshold(oldChart!, MONITORING_THRESHOLD_ID)
        );
      }, 200);
      setInteractionsState({
        highlightedTimeseriesId: undefined,
      });
    };
  }, []);

  useEffect(() => {
    setChart((oldChart) =>
      updateChartThresholdUpperLimit(
        oldChart!,
        MONITORING_THRESHOLD_ID,
        +formValues.alertThreshold
      )
    );
  }, [formValues.alertThreshold, setChart]);

  useEffect(() => {
    const tsSource = timeseries.find((ts: ChartTimeSeries) => {
      return (
        ts.tsExternalId === (formValues.source as ChartTimeSeries)?.tsExternalId
      );
    });
    if (tsSource) {
      setChart((oldChart) =>
        updateChartThresholdSelectedSource(
          oldChart!,
          MONITORING_THRESHOLD_ID,
          tsSource?.id || ''
        )
      );
      const selectedTs = chart?.timeSeriesCollection?.find(
        (currentTs: ChartTimeSeries) => {
          return (
            currentTs.tsExternalId ===
            (formValues.source as ChartTimeSeries)?.tsExternalId
          );
        }
      );
      setInteractionsState({
        highlightedTimeseriesId: selectedTs?.id,
      });
    }
  }, [
    setChart,
    setInteractionsState,
    (formValues.source as ChartTimeSeries)?.tsExternalId,
    JSON.stringify(timeseries.map((ts) => ts.tsExternalId)),
  ]);

  useEffect(() => {
    if (scheduleDurationType?.value === 'm') {
      setValue('schedule', SCHEDULE_MINUTE_OPTIONS[1]);
    }
    if (scheduleDurationType?.value === 'h') {
      setValue('schedule', SCHEDULE_HOUR_OPTIONS[0]);
    }
  }, [scheduleDurationType, setValue]);

  return (
    <form>
      <FieldTitleRequired>{t.Name} </FieldTitleRequired>
      <FormInputWithController
        control={control}
        type="text"
        name="name"
        required={t['Name is required']}
        placeholder={t['Describe monitoring job']}
      />

      <FieldTitleRequired>{t.Source}</FieldTitleRequired>
      <FormInputWithController
        control={control}
        type="timeseries"
        name="source"
        required={t['Source is required']}
      />

      <FieldTitleRequired>{t['Alert when threshold is']} </FieldTitleRequired>
      <Row>
        <Col span={13}>
          <FormInputWithController
            control={control}
            type="select"
            name="alertThresholdType"
            required={`"Alert when" is required`}
            options={[
              {
                label: t.Above,
                value: 'upper_threshold',
              },
              {
                label: t.Below,
                value: 'lower_threshold',
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
            required={t['Alert threshold is required']}
          />
        </Col>
      </Row>

      <FieldTitleRequired>{t['Minimum duration']} </FieldTitleRequired>
      <Row>
        <Col span={24}>
          <FormInputWithController
            control={control}
            type="number"
            max={MINIMUM_DURATION_LIMIT}
            name="minimumDuration"
            placeholder="1"
            suffix={<Chip size="x-small" type="default" label={t.Minutes} />}
            required={t['Minimum duration is required']}
            validate={{
              minDuration: (value: string) =>
                Number(value) >= MINIMUM_DURATION_LIMIT
                  ? 'Minimum duration must be less than 60'
                  : true,
            }}
          />
        </Col>

        <FieldHelperText>
          {t['Set a minimum duration to avoid alert flooding']}
        </FieldHelperText>
      </Row>

      <FieldTitleRequired>{t.Schedule} </FieldTitleRequired>
      <Row>
        <Col span={13}>
          <FormInputWithController
            control={control}
            type="select"
            options={
              scheduleDurationType?.value === 'm'
                ? SCHEDULE_MINUTE_OPTIONS
                : SCHEDULE_HOUR_OPTIONS
            }
            name="schedule"
            placeholder="10"
            required={t['Schedule is required']}
            suffix={<Chip size="small" type="default" label={t.Minutes} />}
          />
        </Col>
        <Col span={1}>&nbsp;</Col>
        <Col span={10}>
          <FormInputWithController
            control={control}
            type="select"
            name="scheduleDurationType"
            required={t['Minimum duration is required']}
            options={[
              {
                label: t.Minutes,
                value: 'm',
              },
            ]}
          />
        </Col>

        <FieldHelperText>
          {t['How often the monitoring job runs']}
        </FieldHelperText>
      </Row>

      <FieldTitleRequired>{t['Save to']} </FieldTitleRequired>
      <MonitoringFolderSelect
        control={control}
        setValue={setValue}
        inputName="folder"
      />

      <SubscribeJob
        title={t['Notifications will be sent to: ']}
        control={control}
      />

      {isDirty && !isValid && (
        <FormError<CreateMonitoringJobFormData> errors={errors} />
      )}

      <PortalWait elementId="monitoring-job-stepper">
        <Row>
          <Col span={10}>
            <Button onClick={handleCancel}>{t.Cancel}</Button>
          </Col>
          <Col span={14}>
            <FullWidthButton
              disabled={!isValid}
              type="primary"
              onClick={() => {
                onNext(formValues);
              }}
            >
              {t.Next}
              <Icon type="ArrowRight" css={{ marginLeft: 8 }} />
            </FullWidthButton>
          </Col>
        </Row>
      </PortalWait>
    </form>
  );
};

export default CreateMonitoringJobStep1;
