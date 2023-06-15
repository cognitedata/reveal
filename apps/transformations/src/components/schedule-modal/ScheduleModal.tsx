import styled from 'styled-components';

import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@transformations/common';
import { StyledCredentialsFormSectionContainer } from '@transformations/components/credentials-form';
import InfoBox from '@transformations/components/info-box';
import {
  useCreateSchedule,
  useDeleteSchedule,
  useUpdateSchedule,
} from '@transformations/hooks';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { TransformationRead } from '@transformations/types';
import { getTrackEvent } from '@transformations/utils';
import { Input, notification } from 'antd';
import cronstrue from 'cronstrue';
import { useFormik } from 'formik';

import { trackEvent } from '@cognite/cdf-route-tracker';
import {
  Body,
  Button,
  Colors,
  Flex,
  Title,
  Modal,
  Detail,
} from '@cognite/cogs.js';

const PREDEFINED_OPTIONS = {
  'every-15-minutes': 'every-15-minutes',
  'every-hour': 'every-hour',
  'once-a-day': 'once-a-day',
  'once-a-week': 'once-a-week',
  'once-a-month': 'once-a-month',
} as const;

type PredefinedOption = keyof typeof PREDEFINED_OPTIONS;

type ScheduleModalProps = {
  transformation: TransformationRead;
};

type ScheduleModalFormValues = {
  cronExpression?: string;
  selectedOption?: PredefinedOption;
};

const ScheduleModal = ({ transformation }: ScheduleModalProps): JSX.Element => {
  const { setIsScheduleModalOpen, isScheduleModalOpen } =
    useTransformationContext();
  const { t } = useTranslation();
  const { mutateAsync: createSchedule } = useCreateSchedule();
  const { mutateAsync: updateSchedule } = useUpdateSchedule();
  const { mutateAsync: deleteSchedule } = useDeleteSchedule();

  const formik = useFormik<ScheduleModalFormValues>({
    enableReinitialize: true,
    initialValues: {
      cronExpression: transformation.schedule?.interval,
    },
    onSubmit: ({ cronExpression }) => {
      const id = transformation.id;

      const getUpdateScheduleData = () => {
        return {
          schedules: [
            {
              id,
              interval: cronExpression!,
              // TODO: check if we want to unpause every time the user edits a schedule
              isPaused: false,
            },
          ],
        };
      };

      const options = {
        onSuccess: () => {
          notification.success({
            key: 'update-transformation',
            message: t('notification-success'),
            description: !transformation.schedule
              ? t('notification-schedule-created')
              : t('notification-schedule-updated'),
          });
          handleCancel();
        },
        onError: (err: unknown) => {
          const _err = err as any;
          notification.error({
            key: 'update-transformation',
            message: t('notification-failed'),
            description: _err.message,
          });
        },
      };

      if (!transformation.schedule) {
        createSchedule(getUpdateScheduleData(), options);
      } else {
        updateSchedule(getUpdateScheduleData(), options);
      }
    },
  });

  const handleCancel = () => {
    formik.resetForm();
    setIsScheduleModalOpen(false);
  };

  const handleRemoveSchedule = () => {
    deleteSchedule({ transformationId: transformation.id });
  };

  const handleResumeSchedule = () => {
    if (transformation.schedule) {
      updateSchedule({
        schedules: [{ ...transformation.schedule, isPaused: false }],
      });
    }
  };

  const handlePauseSchedule = () => {
    if (transformation.schedule) {
      updateSchedule({
        schedules: [{ ...transformation.schedule, isPaused: true }],
      });
    }
  };

  const getFifteenMinuteIntervals = () => {
    const now = new Date();
    const minutes = now.getMinutes();
    const times = [minutes];
    const step = 15;
    for (let i = 1; i < 4; i++) {
      const nextInterval = minutes + i * step;
      if (nextInterval < 60) {
        times.push(nextInterval);
      } else {
        const remainder = nextInterval % 60;
        times.push(remainder);
      }
    }
    return times.sort((a, b) => a - b).join(',');
  };

  const onClickCronPreset = (cronExp: string, option: PredefinedOption) => {
    formik.setFieldValue('cronExpression', cronExp);
    formik.setFieldValue('selectedOption', option);
  };

  const canSubmit = formik.values?.cronExpression;

  const { data: parsedCronExpression } = useQuery(
    ['parse-cron-expression', formik.values.cronExpression],
    () =>
      cronstrue.toString(formik.values.cronExpression ?? '', {
        verbose: true,
      }),
    {
      enabled: !!formik.values.cronExpression,
    }
  );

  const activeSchedule =
    transformation.schedule && !transformation.schedule.isPaused;

  return (
    <Modal
      okText={!activeSchedule ? t('set-schedule') : t('done')}
      okDisabled={!canSubmit}
      onOk={() => {
        trackEvent(
          getTrackEvent('event-tr-details-home-schedule-update-click')
        );
        if (activeSchedule) {
          handleCancel();
        } else {
          formik.handleSubmit();
        }
      }}
      cancelText={t('cancel')}
      additionalActions={
        transformation.schedule
          ? [
              {
                icon: transformation.schedule.isPaused ? 'Play' : 'Pause',
                iconPlacement: 'left',
                children: transformation.schedule.isPaused
                  ? t('resume-schedule')
                  : t('pause-schedule'),
                key: 'isPaused',
                onClick: () =>
                  transformation.schedule?.isPaused
                    ? handleResumeSchedule()
                    : handlePauseSchedule(),
              },
              {
                icon: undefined,
                iconPlacement: undefined,
                children: t('remove-schedule'),
                key: 'remove',
                onClick: () => handleRemoveSchedule(),
              },
            ]
          : undefined
      }
      onCancel={handleCancel}
      title={t('schedule')}
      visible={isScheduleModalOpen}
    >
      {transformation.schedule ? (
        <Flex direction="column" gap={8}>
          <InfoBox icon status="neutral">
            {activeSchedule
              ? t('you-cannot-edit-scheduled-transformation')
              : t('paused-transformation')}
          </InfoBox>
          <StyledCredentialsFormSectionContainer>
            <Flex direction="column">
              <Body level={2} strong>
                {t('cron-expression')}
              </Body>
              <Body level={2}>{transformation?.schedule?.interval}</Body>
              {parsedCronExpression && (
                <StyledCronExpression>
                  {t('cron-server-time', { cron: parsedCronExpression })}
                </StyledCronExpression>
              )}
            </Flex>
          </StyledCredentialsFormSectionContainer>
        </Flex>
      ) : (
        <Flex direction="column" gap={16}>
          <Body level={2}>{t('schedule-description')}</Body>
          <Flex direction="column" gap={8}>
            <Title level={6}>{t('predefined-options')}</Title>
            <Flex gap={4} wrap="wrap">
              <StyledCronPresetButton
                message={t(PREDEFINED_OPTIONS['every-15-minutes'])}
                onClick={() => {
                  onClickCronPreset(
                    `${getFifteenMinuteIntervals()} * * * *`,
                    PREDEFINED_OPTIONS['every-15-minutes']
                  );
                }}
                toggled={
                  formik.values.selectedOption ===
                  PREDEFINED_OPTIONS['every-15-minutes']
                }
              />
              <StyledCronPresetButton
                message={t(PREDEFINED_OPTIONS['every-hour'])}
                onClick={() => {
                  const now = new Date();
                  onClickCronPreset(
                    `${now.getMinutes()} * * * *`,
                    PREDEFINED_OPTIONS['every-hour']
                  );
                }}
                toggled={
                  formik.values.selectedOption ===
                  PREDEFINED_OPTIONS['every-hour']
                }
              />
              <StyledCronPresetButton
                message={t(PREDEFINED_OPTIONS['once-a-day'])}
                onClick={() => {
                  const now = new Date();
                  onClickCronPreset(
                    `${now.getMinutes()} ${now.getHours()} * * *`,
                    PREDEFINED_OPTIONS['once-a-day']
                  );
                }}
                toggled={
                  formik.values.selectedOption ===
                  PREDEFINED_OPTIONS['once-a-day']
                }
              />
              <StyledCronPresetButton
                message={t(PREDEFINED_OPTIONS['once-a-week'])}
                onClick={() => {
                  const now = new Date();
                  onClickCronPreset(
                    `${now.getMinutes()} ${now.getHours()} * * ${now.getDay()}`,
                    PREDEFINED_OPTIONS['once-a-week']
                  );
                }}
                toggled={
                  formik.values.selectedOption ===
                  PREDEFINED_OPTIONS['once-a-week']
                }
              />
              <StyledCronPresetButton
                message={t(PREDEFINED_OPTIONS['once-a-month'])}
                onClick={() => {
                  const now = new Date();
                  onClickCronPreset(
                    `${now.getMinutes()} ${now.getHours()} 1 * *`,
                    PREDEFINED_OPTIONS['once-a-month']
                  );
                }}
                toggled={
                  formik.values.selectedOption ===
                  PREDEFINED_OPTIONS['once-a-month']
                }
              />
            </Flex>
            <Title level={6}>{t('cron-expression')}</Title>
            <Flex direction="column" gap={4}>
              <Input
                aria-label={t('cron-expression')}
                placeholder={t('cron-expression-example-placeholder')}
                name="cron-expression"
                onChange={(e) => {
                  formik.setFieldValue('cronExpression', e.target.value);
                  formik.setFieldValue('selectedOption', undefined);
                }}
                value={formik.values.cronExpression}
              />
              {parsedCronExpression && (
                <StyledCronExpression>
                  {t('cron-server-time', { cron: parsedCronExpression })}
                </StyledCronExpression>
              )}
            </Flex>
          </Flex>
        </Flex>
      )}
    </Modal>
  );
};

const StyledCronPresetButton = styled((props) => (
  <Button type="secondary" size="small" {...props}>
    {props.message}
  </Button>
))`
  white-space: nowrap;
`;

const StyledCronExpression = styled(Detail)`
  color: ${Colors['text-icon--muted']};
`;

export default ScheduleModal;
