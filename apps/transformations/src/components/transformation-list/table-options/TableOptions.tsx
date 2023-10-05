import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import Dropdown from '@transformations/components/dropdown/Dropdown';
import {
  useDuplicateTransformation,
  useRunTransformation,
  useUpdateSchedule,
} from '@transformations/hooks';
import { TransformationListTableRecord } from '@transformations/pages/transformation-list/TransformationListTable';
import { createInternalLink, getTrackEvent } from '@transformations/utils';
import { useCdfUserHistoryService } from '@user-history';
import { notification } from 'antd';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { Button, Colors, Menu } from '@cognite/cogs.js';

type TableOptionsProps = {
  transformation: TransformationListTableRecord;
  onDelete: () => void;
};

const TableOptions = ({
  transformation,
  onDelete,
}: TableOptionsProps): JSX.Element => {
  const { t } = useTranslation();
  const {
    id: transformationId,
    hasCredentials,
    schedule,
    name: transformationName,
  } = transformation;

  const { subAppPath } = useParams<{ subAppPath?: string }>();
  const userHistoryService = useCdfUserHistoryService();

  const { mutate: runTransformation, isLoading: isStartingTransformationJob } =
    useRunTransformation();
  const { mutate: updateSchedule, isLoading: isUpdatingSchedule } =
    useUpdateSchedule();

  const handleRunTransformation = (): void => {
    if (transformationId) {
      trackEvent(getTrackEvent('event-tr-list-more-action-run-click'));
      runTransformation({ id: transformationId });
    }
  };

  const handlePauseSchedule = (): void => {
    if (schedule?.id) {
      trackEvent(getTrackEvent('event-tr-list-more-action-pause-click'));

      if (subAppPath && transformationName)
        userHistoryService.logNewResourceEdit({
          application: subAppPath,
          name: transformationName,
          path: createInternalLink(`${transformationId}`),
        });

      updateSchedule({
        schedules: [
          {
            id: schedule.id,
            isPaused: true,
          },
        ],
      });
    }
  };

  const handleResumeSchedule = (): void => {
    if (schedule?.id) {
      trackEvent(getTrackEvent('event-tr-list-more-action-resume-click'));
      updateSchedule({
        schedules: [
          {
            id: schedule.id,
            isPaused: false,
          },
        ],
      });
    }
  };

  const { mutate: duplicateTransformation } = useDuplicateTransformation();

  const onClickDuplicate = () => {
    trackEvent(getTrackEvent('event-tr-list-more-action-duplicate-click'));
    duplicateTransformation([transformation], {
      onSuccess: (_: unknown, transformations = []) => {
        const [transformation] = transformations;
        notification.success({
          message: t('notification-success'),
          description: t('transformation-notification-duplicate-success', {
            name: transformation?.name,
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

  const handleDeleteTransformation = () => {
    trackEvent(getTrackEvent('event-tr-list-more-action-delete-click'));
    onDelete();
  };

  return (
    <Dropdown
      content={
        <Menu>
          {(!schedule?.interval || schedule.isPaused) && hasCredentials && (
            <Dropdown.Button
              icon="Play"
              loading={isStartingTransformationJob}
              onClick={handleRunTransformation}
              type="ghost"
            >
              {t('run')}
            </Dropdown.Button>
          )}
          {schedule?.interval && schedule.isPaused && (
            <Dropdown.Button
              icon="Play"
              loading={isUpdatingSchedule}
              onClick={handleResumeSchedule}
              type="ghost"
            >
              {t('schedule-resume')}
            </Dropdown.Button>
          )}
          {schedule?.interval && !schedule.isPaused && (
            <Dropdown.Button
              icon="Pause"
              loading={isUpdatingSchedule}
              onClick={handlePauseSchedule}
              type="ghost"
            >
              {t('schedule-pause')}
            </Dropdown.Button>
          )}
          <Dropdown.Button
            icon="Duplicate"
            type="ghost"
            onClick={onClickDuplicate}
          >
            {t('duplicate')}
          </Dropdown.Button>
          <Dropdown.Divider />
          <Dropdown.Button
            icon="Delete"
            type="ghost-destructive"
            onClick={handleDeleteTransformation}
          >
            {t('transformation-delete')}
          </Dropdown.Button>
        </Menu>
      }
      hideOnSelect={{
        hideOnContentClick: true,
        hideOnOutsideClick: true,
      }}
      placement="bottom-end"
    >
      <StyledButton
        aria-label="Options"
        icon="EllipsisHorizontal"
        type="ghost"
      />
    </Dropdown>
  );
};

export default TableOptions;

const StyledButton = styled(Button)`
  &:hover {
    background-color: ${Colors['surface--interactive--toggled-hover']};
    color: ${Colors['text-icon--status-neutral']};
  }

  &:active {
    background-color: ${Colors['surface--interactive--toggled-pressed']};
    color: ${Colors['text-icon--status-neutral']};
  }
`;
