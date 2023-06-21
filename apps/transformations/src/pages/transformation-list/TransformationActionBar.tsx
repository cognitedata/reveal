import { useState } from 'react';

import styled from 'styled-components';

import { TOOLTIP_DELAY_IN_MS, useTranslation } from '@transformations/common';
import Collapse from '@transformations/components/collapse';
import DeleteTransformationModal from '@transformations/components/delete-transformation-modal';
import UpdateScheduleModal from '@transformations/components/update-schedule-modal/UpdateScheduleModal';
import {
  useDeleteTransformation,
  useDuplicateTransformation,
  useUpdateSchedule,
} from '@transformations/hooks';
import { Schedule } from '@transformations/types';
import { getTrackEvent } from '@transformations/utils';
import { notification, Modal, Alert } from 'antd';

import { trackEvent } from '@cognite/cdf-route-tracker';
import {
  Body,
  Button,
  ButtonProps,
  Detail,
  Flex,
  Icon,
  IconProps,
  Title,
  Tooltip,
  Colors,
} from '@cognite/cogs.js';

import { TransformationListTableRecord } from './TransformationListTable';

type TransformationActionBarProps = {
  selectedRows: TransformationListTableRecord[];
  onClose: () => void;
};

function getTransformationIds(data: TransformationListTableRecord[] = []) {
  return data.map((row) => row.id).filter(Boolean);
}

const TransformationActionBar = ({
  selectedRows,
  onClose,
}: TransformationActionBarProps) => {
  const { t } = useTranslation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isUpdateScheduleModalOpen, setIsUpdateScheduleModalOpen] =
    useState(false);
  const areAllSchedulesBlocked = !selectedRows.find((row) => !row.blocked);
  const shouldDisplay = !!selectedRows.length;

  const { mutate: bulkDuplicate, isLoading: isDuplicating } =
    useDuplicateTransformation();
  const { mutate: bulkDelete, isLoading: isDeleting } =
    useDeleteTransformation();
  const { mutate: bulkUpdate, isLoading: isUpdatingSchedule } =
    useUpdateSchedule();
  // TODO: uncomment if we have a resolution on this
  // const { mutate: bulkSchedule, isLoading: isBulkScheduleRunning } =
  //   useScheduleTransformation();

  const onDeleteTransformations = async () => {
    const transformationIds = getTransformationIds(selectedRows) as number[];
    trackEvent(getTrackEvent('event-tr-list-bulk-action-delete-click'));
    bulkDelete(transformationIds, {
      onSuccess: (_, ids = []) => {
        notification.success({
          message: t('transformation-delete'),
          description: t('transformation-delete-notification-success', {
            namesOrIds: ids.join(', '),
            count: ids.length,
          }),
        });
      },
      onError: (error) => {
        const missing = (error?.missing ?? []) as { id: number }[];
        const missingIds = missing.map(({ id }) => id);
        notification.error({
          message: t('notification-failed'),
          description: t('transformation-delete-notification-error', {
            namesOrIds: missingIds.join(', '),
            count: missingIds.length,
          }),
        });
      },
      onSettled: () => {
        setIsDeleteModalOpen(false);
      },
    });
  };

  const onDuplicateTransformations = async () => {
    trackEvent(getTrackEvent('event-tr-list-bulk-action-duplicate-click'));
    bulkDuplicate(selectedRows, {
      onSuccess: (_, transformations = []) => {
        const count = transformations.length;

        notification.success({
          message: t('notification-success'),
          description: t('notification-duplicated-success', {
            count,
          }),
        });
      },
      onError: () => {
        notification.error({
          message: t('error'),
          description: t('transformation-notification-duplicate-error'),
        });
      },
    });
  };

  const onUpdateSchedule = async () => {
    const scheduleType = scheduleButtonDisplay();
    if (scheduleType !== undefined) {
      trackEvent(
        getTrackEvent(
          scheduleType === 'pause'
            ? 'event-tr-list-more-action-pause-click'
            : 'event-tr-list-more-action-resume-click'
        )
      );
      const selectedSchedules: Schedule[] = selectedRows.map(
        (transformation) => {
          const schedule: Schedule = {
            ...transformation.schedule,
            isPaused: scheduleType === 'pause' ? true : false,
          } as Schedule;
          return schedule;
        }
      );
      bulkUpdate(
        { schedules: selectedSchedules },
        {
          onSuccess: (_, { schedules = [] }) => {
            const count = schedules.length;
            notification.success({
              message: t('notification-success'),
              description: t(
                scheduleType === 'pause'
                  ? 'notification-paused-success'
                  : 'notification-resumed-success',
                {
                  count,
                }
              ),
            });
          },
          onError: () => {
            notification.error({
              message: t('error'),
              description: t(
                scheduleType === 'pause'
                  ? 'transformation-notification-pause-error'
                  : 'transformation-notification-resume-error'
              ),
            });
          },
        }
      );
    }
  };
  // TODO: commenting this out because it doesn't seem to work
  // we're unsure if there's a way for us to bulk reschedule blocked
  // transformations.
  //
  // const onScheduleTransformations = async () => {
  //   const transformations = selectedRows.map(({ schedule }) => {
  //     return {
  //       externalId: schedule?.externalId || '',
  //       interval: schedule?.interval || '',
  //       isPaused: false,
  //     };
  //   });

  //   bulkSchedule(transformations, {
  //     // TODO: i18n
  //     onSuccess: (_, transformations = []) => {
  //       notification.success({
  //         message: t('notification-success'),
  //         description: t('transformation-notification-update-multiple', {
  //           count: transformations.length,
  //         }),
  //       });
  //     },
  //     onError: (error) => {
  //       notification.error({
  //         message: t('notification-failed'),
  //         description: t('notification-error-reason', {
  //           error,
  //         }),
  //       });
  //     },
  //   });
  // };

  const onCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  if (!shouldDisplay) {
    return null;
  } else {
    trackEvent(getTrackEvent('event-tr-list-bulk-action-click'));
  }

  const scheduleButtonDisplay = () => {
    if (
      selectedRows.every(
        (transformation) => transformation.schedule?.isPaused === true
      )
    ) {
      return 'resume';
    } else if (
      selectedRows.every(
        (transformation) => transformation.schedule?.isPaused === false
      )
    ) {
      return 'pause';
    } else {
      return undefined;
    }
  };

  return (
    <>
      <StyledActionBarContainer>
        <StyledActionBarInfo>
          <StyledActionBarTitle>
            {t('n-transformation-selected', {
              count: selectedRows.length || 0,
            })}
          </StyledActionBarTitle>
          {areAllSchedulesBlocked && (
            <StyledActionBarDetail>
              {t('transformation-all-schedules-blocked')}
            </StyledActionBarDetail>
          )}
        </StyledActionBarInfo>
        <StyledActionBarButtonGroup>
          {/* TODO: commenting this out for the same reason as above */}
          {/* {areAllSchedulesBlocked && (
            <StyledActionButton
              type="secondary"
              iconType="CalendarClock"
              text={t('transformations-restart-all-schedules')}
              onClick={onScheduleTransformations}
            />
          )} */}
          <StyledActionBarDivider />
          {scheduleButtonDisplay() !== undefined && (
            <StyledActionButton
              iconType="Clock"
              text={t(
                scheduleButtonDisplay() === 'pause'
                  ? 'schedule-pause'
                  : 'schedule-resume'
              )}
              onClick={() => {
                if (selectedRows.length > 1) {
                  setIsUpdateScheduleModalOpen(true);
                } else {
                  onUpdateSchedule();
                }
              }}
              inverted
            />
          )}
          <StyledActionButton
            iconType="Duplicate"
            text={t('duplicate')}
            onClick={() => {
              if (selectedRows.length > 1) {
                setIsDuplicateModalOpen(true);
              } else {
                onDuplicateTransformations();
              }
            }}
            inverted
          />
          <StyledActionButton
            inverted
            type="ghost-destructive"
            iconType="Delete"
            text={t('transformation-delete')}
            onClick={() => {
              setIsDeleteModalOpen(true);
            }}
          />
          <StyledActionBarDivider />
          <Tooltip
            content={t('clear-selection')}
            delay={TOOLTIP_DELAY_IN_MS}
            css={{ transform: 'translateY(-8px)' }}
          >
            <StyledActionButton
              iconType="Close"
              onClick={onClose}
              aria-label={t('close')}
              inverted
            />
          </Tooltip>
        </StyledActionBarButtonGroup>
      </StyledActionBarContainer>
      {isDeleteModalOpen && (
        <DeleteTransformationModal
          handleClose={onCloseDeleteModal}
          handleDelete={onDeleteTransformations}
          items={selectedRows}
          isEmpty={
            selectedRows[0] &&
            !selectedRows[0].query &&
            !selectedRows[0].lastFinishedJob
          }
          visible={isDeleteModalOpen}
          loading={isDeleting}
        />
      )}
      <Modal
        title={
          <Flex gap={8} alignItems="center">
            <StyledInfoIcon />
            <Title level={5}>
              {t('transformations-duplicate-modal-title')}
            </Title>
          </Flex>
        }
        open={isDuplicateModalOpen}
        onOk={onDuplicateTransformations}
        onCancel={() => setIsDuplicateModalOpen(false)}
        cancelButtonProps={{
          children: t('cancel'),
          disabled: isDuplicating,
          type: 'text',
        }}
        okButtonProps={{
          children: t(
            isDuplicating
              ? 'transformations-duplicate-modal-button-duplicating'
              : 'transformations-duplicate-modal-button-duplicate'
          ),
          loading: isDuplicating,
          type: 'primary',
        }}
        closeIcon={<Icon type="Close" />}
      >
        <Flex gap={10} direction="column">
          <Body>{t('these-transformations-will-be-duplicated')}</Body>
          {selectedRows.length > 5 ? (
            <Collapse
              title={t('n-transformations', { count: selectedRows.length })}
              type="info"
            >
              <StyledErrorList>
                {selectedRows.map((row) => (
                  <li key={row.id}>
                    <Body level="3">{row.name}</Body>
                  </li>
                ))}
              </StyledErrorList>
            </Collapse>
          ) : (
            <Alert
              type="info"
              message={
                <StyledErrorList>
                  {selectedRows.map((row) => (
                    <li key={row.id}>
                      <Body level="3">{row.name}</Body>
                    </li>
                  ))}
                </StyledErrorList>
              }
            />
          )}
        </Flex>
      </Modal>
      <UpdateScheduleModal
        scheduleType={scheduleButtonDisplay()}
        handleClose={() => setIsUpdateScheduleModalOpen(false)}
        handleOk={onUpdateSchedule}
        items={selectedRows}
        visible={isUpdateScheduleModalOpen}
        loading={isUpdatingSchedule}
      />
    </>
  );
};

export default TransformationActionBar;

const StyledActionBarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  inset: auto 40px 24px;
  height: 56px;
  padding: 0px 16px;
  background-color: rgba(0, 0, 0, 0.9);
  box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.04),
    0px 3px 8px rgba(0, 0, 0, 0.06);
  border-radius: 12px;
`;

const StyledActionBarInfo = styled.div`
  display: flex;
  gap: 4px;
  flex-direction: column;
`;

const StyledActionBarTitle = styled(Title).attrs({
  level: 5,
})`
  letter-spacing: -0.01em;
  color: #fff;
`;

const StyledActionBarDetail = styled(Detail).attrs({
  strong: true,
})`
  letter-spacing: -0.004em;
  color: #fff;
  opacity: 0.5;
`;

const StyledActionBarButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

type ActionButtonProps = ButtonProps & {
  iconType?: IconProps['type'];
  text?: string;
};

const ActionButton = ({
  type = 'ghost',
  text,
  iconType,
  onClick,
  ...props
}: ActionButtonProps) => (
  <Button type={type as any} onClick={onClick} {...props}>
    {iconType && <Icon type={iconType} />}
    {text && <span>{text}</span>}
  </Button>
);

const StyledActionButton = styled(ActionButton)`
  color: ${(props) => {
    switch (props.type) {
      case 'ghost-destructive':
        return '#ff928a';
      case 'secondary':
        return 'rgba(0, 0, 0, 0.9)';
      default:
        return '#fff';
    }
  }};

  &:hover {
    color: rgba(0, 0, 0, 0.9);
    opacity: 1;
  }

  i:not(:only-child) {
    margin-right: 10px;
  }
`;

const StyledActionBarDivider = styled.div`
  width: 2px;
  height: 20px;
  background: rgba(71, 71, 71, 0.4);
  border-radius: 4px;
`;

const StyledInfoIcon = styled(Icon).attrs({
  type: 'InfoFilled',
  size: 14,
})`
  color: ${Colors['text-icon--status-neutral']};
`;

const StyledErrorList = styled.ul`
  margin: 0;
  padding-left: 22px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;
