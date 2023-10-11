import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import * as Sentry from '@sentry/react';

import { Button, Flex, Icon } from '@cognite/cogs.js';

import { useUserProfileQuery } from '../../common/providers/useUserProfileQuery';
import { ErrorIcon } from '../../components/Icons/Error';
import { SuccessIcon } from '../../components/Icons/Success';
import { useMonitoringSubscriptionDelete } from '../../components/MonitoringSidebar/hooks';
import { useTranslations } from '../../hooks/translations';
import { createInternalLink } from '../../utils/link';
import { makeDefaultTranslations } from '../../utils/translations';

import { UnsubscribeCard } from './UnsubscribeCard';

type Status = 'unsubscribing' | 'success' | 'error' | 'userProfileError';

const defaultTranslations = makeDefaultTranslations(
  'Unsubscribing',
  'Please wait while we process your request',
  'Unsubscribe failed',
  'Please retry, try again later or contact us',
  'Unsubscribed successfully',
  'You will no longer receive email notifications from this monitoring job',
  'Retry',
  'Go to my charts',
  'User profile not found',
  'Please contact your CDF administrator'
);

export const UnsubscribePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslations(
    Object.keys(defaultTranslations),
    'UnsubscribeMonitoringJob'
  );
  const [status, setStatus] = useState<Status>('unsubscribing');
  const { channelId = '' } = useParams<{ channelId?: string }>();
  const { mutateAsync } = useMonitoringSubscriptionDelete();
  const {
    data: userProfile,
    isFetching: isFetchingUser,
    error: userProfileError,
  } = useUserProfileQuery();
  const isUserPresent = !isFetchingUser && !userProfileError && userProfile;

  const handleUnsubscribe = async () => {
    setStatus('unsubscribing');
    if (isUserPresent) {
      mutateAsync({
        channelID: Number(channelId),
        subscribers: [{ userIdentifier: userProfile.userIdentifier }],
      })
        .then(() => {
          setStatus('success');
        })
        .catch((error) => {
          setStatus('error');
          Sentry.captureException(error);
        });
    }
  };

  useEffect(() => {
    if (isUserPresent) {
      handleUnsubscribe();
    } else if (userProfileError) {
      setStatus('userProfileError');
    }
  }, [isFetchingUser]);

  return (
    <StyledFlex justifyContent="center" alignItems="center">
      {status === 'unsubscribing' ? (
        <UnsubscribeCard
          icon={<Icon type="Loader" size={80} />}
          title={t['Unsubscribing']}
          subtitle={t['Please wait while we process your request']}
        />
      ) : null}
      {status === 'success' ? (
        <UnsubscribeCard
          icon={<SuccessIcon />}
          title={t['Unsubscribed successfully']}
          subtitle={
            t[
              'You will no longer receive email notifications from this monitoring job'
            ]
          }
          actions={
            <Button
              type="primary"
              icon="ArrowRight"
              iconPlacement="right"
              onClick={() => {
                navigate(createInternalLink());
              }}
            >
              {t['Go to my charts']}
            </Button>
          }
        />
      ) : null}
      {status === 'error' ? (
        <UnsubscribeCard
          icon={<ErrorIcon />}
          title={t['Unsubscribe failed']}
          subtitle={t['Please retry, try again later or contact us']}
          actions={
            <>
              <Button
                type="primary"
                icon="Refresh"
                iconPlacement="right"
                onClick={handleUnsubscribe}
              >
                {t['Retry']}
              </Button>
              <Button
                icon="ArrowRight"
                iconPlacement="right"
                onClick={() => {
                  navigate(createInternalLink());
                }}
              >
                {t['Go to my charts']}
              </Button>
            </>
          }
        />
      ) : null}
      {status === 'userProfileError' ? (
        <UnsubscribeCard
          icon={<ErrorIcon />}
          title={t['User profile not found']}
          subtitle={t['Please contact your CDF administrator']}
        />
      ) : null}
    </StyledFlex>
  );
};

const StyledFlex = styled(Flex)`
  background-color: var(--cogs-surface--interactive--toggled-default);
  width: 100%;
`;

export default UnsubscribePage;
