import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { useTranslation } from '@transformations/common';
import CredentialsMissingModal from '@transformations/components/credentials-missing-modal/CredentialsMissingModal';
import CredentialsModal from '@transformations/components/credentials-modal/CredentialsModal';
import RunConfirmationModal from '@transformations/components/run-confirmation-modal';
import { useRunTransformationAndOpenTab } from '@transformations/hooks';
import { useTokenExchangeSupport } from '@transformations/hooks/sessions';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { TransformationRead } from '@transformations/types';
import {
  createInternalLink,
  getContainer,
  getTrackEvent,
  hasCredentials,
} from '@transformations/utils';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { useCdfUserHistoryService } from '@cognite/cdf-utilities';
import { Button, Chip, Dropdown, Flex, Icon, Menu } from '@cognite/cogs.js';

type TransformationDetailsTopbarActionButtonsProps = {
  isLoading: boolean;
  transformation: TransformationRead;
};

const { Item } = Menu;

const TransformationDetailsTopbarActionButtons = ({
  isLoading,
  transformation,
}: TransformationDetailsTopbarActionButtonsProps): JSX.Element => {
  const { t } = useTranslation();

  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();
  const userHistoryService = useCdfUserHistoryService();

  const { isQueryValid, setIsScheduleModalOpen } = useTransformationContext();

  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [isCredentialsMissingModalOpen, setIsCredentialsMissingModalOpen] =
    useState(false);
  const [runConfirmationModalState, setRunConfirmationModalState] = useState<{
    open: boolean;
    personalCredentials?: boolean;
  }>({ open: false, personalCredentials: false });

  const { data: isTokenExchangeSupported } = useTokenExchangeSupport();

  const { mutate: runTransformation, isLoading: isTransformationRunning } =
    useRunTransformationAndOpenTab();

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  if (!transformation) {
    return <></>;
  }

  const handleRunNowButtonClick = (personalCredentials = false) => {
    if (isQueryValid) {
      runTransformation({ id: transformation.id, personalCredentials });
    } else {
      setRunConfirmationModalState({ open: true, personalCredentials });
    }
  };

  return (
    <Flex gap={8}>
      <Dropdown
        hideOnSelect={{
          hideOnContentClick: true,
          hideOnOutsideClick: true,
        }}
        appendTo={getContainer()}
        content={
          <Menu>
            {isTokenExchangeSupported?.supported && (
              <Item
                key="personal-credentials"
                onClick={() => {
                  trackEvent(getTrackEvent('event-tr-details-run-now-click'));
                  handleRunNowButtonClick(true);
                }}
              >
                {t('run-as-current-user')}
              </Item>
            )}
            <Item
              key="oidc-credentials"
              onClick={() => {
                trackEvent(getTrackEvent('event-tr-details-run-now-click'));
                if (!hasCredentials(transformation)) {
                  setIsCredentialsMissingModalOpen(true);
                } else {
                  handleRunNowButtonClick();
                }
              }}
            >
              <Flex gap={10} justifyContent="space-between">
                {t('run-with-client-credentials')}
                {hasCredentials(transformation) ? (
                  <Chip label={t('configured')} size="x-small" type="success" />
                ) : (
                  <Chip label={t('not-configured')} size="x-small" />
                )}
              </Flex>
            </Item>
            <Item
              key="schedule"
              onClick={() => {
                trackEvent(getTrackEvent('event-tr-details-schedule-click'));
                if (!hasCredentials(transformation)) {
                  setIsCredentialsMissingModalOpen(true);
                } else {
                  setIsScheduleModalOpen(true);
                }
              }}
            >
              <Flex gap={10} justifyContent="space-between">
                {t('schedule-to-run')}
                {!transformation?.schedule ? (
                  <Chip label={t('not-configured')} size="x-small" />
                ) : (
                  <Chip
                    label={
                      transformation?.schedule?.isPaused
                        ? t('schedule-paused')
                        : t('configured')
                    }
                    size="x-small"
                    type={
                      transformation?.schedule?.isPaused ? 'default' : 'success'
                    }
                  />
                )}
              </Flex>
            </Item>
          </Menu>
        }
      >
        <Button
          icon="ChevronDown"
          iconPlacement="right"
          loading={isTransformationRunning}
          type="primary"
        >
          {t('run')}
        </Button>
      </Dropdown>
      <CredentialsMissingModal
        onCancel={() => setIsCredentialsMissingModalOpen(false)}
        onConfirm={() => {
          setIsCredentialsMissingModalOpen(false);
          setIsCredentialsModalOpen(true);
        }}
        open={isCredentialsMissingModalOpen}
      />
      <CredentialsModal
        onCancel={() => setIsCredentialsModalOpen(false)}
        transformation={transformation}
        visible={isCredentialsModalOpen}
      />

      <RunConfirmationModal
        onCancel={() => setRunConfirmationModalState({ open: false })}
        onConfirm={() => {
          runTransformation({
            id: transformation.id,
            personalCredentials:
              !!runConfirmationModalState.personalCredentials,
          });
          if (subAppPath && transformation?.name)
            userHistoryService.logNewResourceEdit({
              application: subAppPath,
              name: transformation.name,
              path: createInternalLink(`${transformation.id}`),
            });
          setRunConfirmationModalState({ open: false });
        }}
        open={runConfirmationModalState.open}
        items={
          transformation?.name
            ? [{ id: transformation.id, name: transformation.name }]
            : []
        }
      />
    </Flex>
  );
};

export default TransformationDetailsTopbarActionButtons;
