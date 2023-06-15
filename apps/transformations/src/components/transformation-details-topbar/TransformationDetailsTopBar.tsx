/* eslint-disable no-nested-ternary */
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import CredentialsMissingModal from '@transformations/components/credentials-missing-modal/CredentialsMissingModal';
import CredentialsModal from '@transformations/components/credentials-modal/CredentialsModal';
import DeleteTransformationModal from '@transformations/components/delete-transformation-modal';
import Dropdown from '@transformations/components/dropdown/Dropdown';
import GeneralSettingsModal from '@transformations/components/general-settings-modal';
import Tooltip from '@transformations/components/tooltip';
import UpdateRecipients from '@transformations/components/update-recipients-modal/UpdateRecipientsModal';
import {
  useDataSet,
  useDeleteTransformation,
  useDuplicateTransformation,
} from '@transformations/hooks';
import { useTransformationNotifications } from '@transformations/hooks/notifications';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import {
  TransformationRead,
  ManifestTransformationRead,
} from '@transformations/types';
import {
  createInternalLink,
  CLI_MANIFEST,
  TOOLTIP_DELAY_IN_MS,
  getTrackEvent,
  getContainer,
  hasCredentials,
} from '@transformations/utils';
import { notification } from 'antd';
import yaml from 'yaml';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { createLink, SecondaryTopbar } from '@cognite/cdf-utilities';
import { Colors, Detail, Flex, Menu, Link } from '@cognite/cogs.js';

import TransformationDetailsSaveIndicator from '../../pages/transformation-details/TransformationDetailsSaveIndicator';

import PreviewButton from './PreviewButton';
import ScheduleChip from './ScheduleChip';
import TransformationDetailsTopbarActionButtons from './TransformationDetailsTopbarActionButtons';

const TransformationTopBar = ({
  transformation,
}: {
  transformation: TransformationRead;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setIsScheduleModalOpen } = useTransformationContext();

  const [isDeleteModalVisible, setIsDeleteModalVisible] =
    useState<boolean>(false);

  const [isGeneralSettingsModalOpen, setIsGeneralSettingsModalOpen] =
    useState(false);

  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [isCredentialsMissingModalOpen, setIsCredentialsMissingModalOpen] =
    useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();

  const { mutate: deleteTransformation, isLoading: isDeletingTransformation } =
    useDeleteTransformation();
  const { mutate: duplicateTransformation } = useDuplicateTransformation();

  const { data: notificationsData } = useTransformationNotifications(
    transformation.id
  );

  const { data: dataSet } = useDataSet(transformation.dataSetId);

  const notifications = notificationsData?.items ?? [];

  const getManifestData = () => {
    const {
      externalId,
      name,
      query,
      destination,
      ignoreNullFields,
      conflictMode,
      isPublic,
      dataSetId,
    } = transformation ?? {};

    const manifestData: ManifestTransformationRead = {
      externalId,
      name,
      query,
      destination,
      ignoreNullFields,
      shared: isPublic,
      action: conflictMode,
    };
    if (transformation?.schedule?.interval) {
      manifestData['schedule'] = {
        interval: transformation.schedule.interval,
        isPaused: transformation.schedule.isPaused,
      };
    }
    if (notifications.length > 0) {
      manifestData['notifications'] = notifications.map(
        (not) => not.destination
      );
    }
    if (dataSetId) {
      if (dataSet?.externalId) {
        manifestData['dataSetExternalId'] = dataSet.externalId;
      } else {
        manifestData['dataSetId'] = dataSetId;
      }
    }

    return `${CLI_MANIFEST.HEADER}\n${yaml.stringify(manifestData)}${
      CLI_MANIFEST.FOOTER
    }`;
  };

  const handleCLIManifest = async () => {
    trackEvent(getTrackEvent('event-tr-details-cli-manifest-click'));
    const manifest = getManifestData();
    const blob = new Blob([manifest], { type: 'application/yaml' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${transformation.externalId}.yaml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDuplicate = () => {
    trackEvent(getTrackEvent('event-tr-details-duplicate-click'));
    duplicateTransformation([transformation], {
      onSuccess: (_: unknown, transformations = []) => {
        const [duplicatedTransformation] = transformations;
        notification.success({
          message: t('notification-success'),
          description: t('transformation-notification-duplicate-success', {
            name: duplicatedTransformation?.name,
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

  const closeDeleteModal = () => setIsDeleteModalVisible(false);
  const handleDeleteTransformation = () => {
    trackEvent(getTrackEvent('event-tr-details-delete-click'));
    deleteTransformation([transformation.id], {
      onError: () => {
        notification.error({
          message: t('transformation-delete-notification-error', {
            count: 1,
            namesOrIds: transformation?.name,
          }),
        });
      },
      onSuccess: () => {
        notification.success({
          message: t('transformation-delete-notification-success', {
            count: 1,
            namesOrIds: transformation?.name,
          }),
        });
        closeDeleteModal();
        navigate(createInternalLink(''));
      },
    });
  };

  return (
    <>
      <SecondaryTopbar
        extraContentLeft={
          <ScheduleChip
            blocked={transformation.blocked}
            schedule={transformation.schedule}
          />
        }
        extraContent={
          <Flex alignItems="center">
            <Flex>
              <TransformationDetailsSaveIndicator
                transformationId={transformation.id}
              />
            </Flex>
            <SecondaryTopbar.Divider />
            <Flex gap={10}>
              <PreviewButton transformation={transformation} />
              <TransformationDetailsTopbarActionButtons
                isLoading={false}
                transformation={transformation}
              />
            </Flex>
          </Flex>
        }
        goBackFallback={createLink(`/${subAppPath}`)}
        optionsDropdownProps={{
          appendTo: getContainer(),
          hideOnSelect: {
            hideOnContentClick: true,
            hideOnOutsideClick: true,
          },
          content: (
            <Menu>
              <Menu.Item
                icon="Settings"
                iconPlacement="left"
                onClick={() => setIsGeneralSettingsModalOpen(true)}
              >
                {t('general')}
              </Menu.Item>
              <Menu.Item
                icon="Verified"
                iconPlacement="left"
                onClick={() => setIsCredentialsModalOpen(true)}
              >
                {t('credentials')}
              </Menu.Item>
              <Menu.Item
                icon="Clock"
                onClick={() => {
                  if (!hasCredentials(transformation)) {
                    setIsCredentialsMissingModalOpen(true);
                  } else {
                    setIsScheduleModalOpen(true);
                  }
                }}
                iconPlacement="left"
              >
                {t('schedule')}
              </Menu.Item>
              <Menu.Item
                icon="Bell"
                iconPlacement="left"
                onClick={() => setIsNotificationModalOpen(true)}
              >
                {t('notifications')}
              </Menu.Item>
              <Dropdown.Divider />
              <Tooltip
                content={t('cli-manifest-info')}
                delay={TOOLTIP_DELAY_IN_MS}
                placement="left"
              >
                <Menu.Item
                  icon="Download"
                  iconPlacement="left"
                  onClick={handleCLIManifest}
                >
                  {t('cli-manifest')}
                </Menu.Item>
              </Tooltip>
              <Menu.Item
                icon="Duplicate"
                iconPlacement="left"
                onClick={handleDuplicate}
              >
                {t('duplicate')}
              </Menu.Item>
              <Menu.Item
                icon="Delete"
                iconPlacement="left"
                onClick={() => setIsDeleteModalVisible(true)}
                destructive
              >
                {t('delete')}
              </Menu.Item>
            </Menu>
          ),
        }}
        title={transformation?.name}
      />
      <DeleteTransformationModal
        handleClose={closeDeleteModal}
        handleDelete={handleDeleteTransformation}
        items={
          transformation?.name
            ? [{ id: transformation.id, name: transformation?.name }]
            : []
        }
        visible={isDeleteModalVisible}
        loading={isDeletingTransformation}
      />
      <GeneralSettingsModal
        onCancel={() => setIsGeneralSettingsModalOpen(false)}
        transformation={transformation}
        visible={isGeneralSettingsModalOpen}
      />

      <CredentialsModal
        onCancel={() => setIsCredentialsModalOpen(false)}
        transformation={transformation}
        visible={isCredentialsModalOpen}
      />
      <CredentialsMissingModal
        onCancel={() => setIsCredentialsMissingModalOpen(false)}
        onConfirm={() => {
          setIsCredentialsMissingModalOpen(false);
          setIsCredentialsModalOpen(true);
        }}
        open={isCredentialsMissingModalOpen}
      />
      <UpdateRecipients
        transformationId={transformation.id}
        notifications={notifications}
        open={isNotificationModalOpen}
        onCancel={() => setIsNotificationModalOpen(false)}
      />
    </>
  );
};

export default TransformationTopBar;

export const TransformationExternalId = styled(Detail)`
  color: ${Colors['text-icon--muted']};
`;

export const VStack = styled(Flex).attrs(({ gap }: { gap: number }) => ({
  gap,
  direction: 'column',
}))``;

export const StyledCogsLink = styled(Link)`
  && {
    justify-content: space-between;
  }
`;
