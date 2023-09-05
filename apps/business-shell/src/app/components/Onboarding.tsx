import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  InternalStep,
  OnboardingModal,
  useOrientation,
  ONBOARDING_MODAL_ACTIONS,
} from '@fusion/shared/user-onboarding-components';
import useLocalStorageState from 'use-local-storage-state';

import { ModalCloseReason } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import image1 from '../../images/carousel-image_1.png';
import image2 from '../../images/carousel-image_2.png';
import image3 from '../../images/carousel-image_3.png';
import { useTracker } from '../common/metrics';

export const Onboarding = () => {
  const { isEnabled: isOnboardingEnabled } = useFlag('ONBOARDING_GUIDE', {
    forceRerender: true,
    fallback: false,
  });

  const { t } = useTranslation();
  const images = useMemo(
    () => [
      {
        image: image1,
        title: t('ONBOARDING_MODAL_CAROUSEL_TITLE_1'),
        subtitle: t('ONBOARDING_MODAL_CAROUSEL_DESCRIPTION_1'),
      },
      {
        image: image2,
        title: t('ONBOARDING_MODAL_CAROUSEL_TITLE_2'),
        subtitle: t('ONBOARDING_MODAL_CAROUSEL_DESCRIPTION_2'),
      },
      {
        image: image3,
        title: t('ONBOARDING_MODAL_CAROUSEL_TITLE_3'),
        subtitle: t('ONBOARDING_MODAL_CAROUSEL_DESCRIPTION_3'),
      },
    ],
    [t]
  );

  const steps: InternalStep[] = useMemo(
    () => [
      {
        target: '.orientation-site-selection',
        title: t('ORIENTATION_TOOLTIP_TITLE_SITE_SELECTOR'),
        description: t('ORIENTATION_TOOLTIP_DESCRIPTION_SITE_SELECTOR'),
        icon: 'Location',
      },
      {
        target: '.navigation-bar',
        title: t('ORIENTATION_TOOLTIP_TITLE_NAVIGATION_BAR'),
        description: t('ORIENTATION_TOOLTIP_DESCRIPTION_NAVIGATION_BAR'),
        icon: 'BarOver',
      },
      {
        target: '.user-menu',
        title: t('ORIENTATION_TOOLTIP_TITLE_ACCOUNT_SETTINGS'),
        description: t('ORIENTATION_TOOLTIP_DESCRIPTION_ACCOUNT_SETTINGS'),
        icon: 'UserSuccess',
      },
      {
        target: '.search-bar-container',
        title: t('ORIENTATION_TOOLTIP_TITLE_EXPLORE'),
        description: t('ORIENTATION_TOOLTIP_DESCRIPTION_EXPLORE'),
        icon: 'Search',
      },
      {
        target: '.cogs-segmented-control--ai-switch',
        title: t('ORIENTATION_TOOLTIP_TITLE_SMART_SEARCH'),
        description: t('ORIENTATION_TOOLTIP_DESCRIPTION_SMART_SEARCH'),
        icon: 'ArrowDown',
      },
    ],
    [t]
  );
  const [onboardingModalPopup, setOnboardingModalPopup] =
    useLocalStorageState<boolean>('onboarding-modal-popup', {
      defaultValue: true,
    });

  const { handleState } = useOrientation();
  const { track } = useTracker();

  const onTrackEvent = useCallback(
    (eventName: string, metaData: any) => {
      track(`BusinessShell.Onboarding.${eventName}`, metaData);
    },
    [track]
  );

  const onCancel = (reason: ModalCloseReason) => {
    if (reason === 'closeClick')
      track('BusinessShell.Onboarding.Modal', {
        action: ONBOARDING_MODAL_ACTIONS.CLOSED,
        step: `carousel-step-1`,
      });

    if (reason === 'cancelClick')
      track('BusinessShell.Onboarding.Modal', {
        action: ONBOARDING_MODAL_ACTIONS.CANCELLED,
        step: `carousel-step-1`,
      });

    if (reason === 'backdropClick') return;
    setOnboardingModalPopup(false);
  };
  const onOk = () => {
    track('BusinessShell.Onboarding.Modal', {
      action: ONBOARDING_MODAL_ACTIONS.SUCCESS,
      step: `carousel-step-1`,
    });
    handleState({
      open: true,
      steps,
      onTrackEvent,
      id: 'business-shell-onboarding-1',
    });
    setOnboardingModalPopup(false);
  };
  const modalTextProps = {
    body: t('ONBOARDING_MODAL_BODY'),
    cancelText: t('ONBOARDING_MODAL_CANCEL_TEXT'),
    title: t('ONBOARDING_MODAL_TITLE'),
    okText: t('ONBOARDING_MODAL_ACTION_TEXT'),
  };

  return onboardingModalPopup && isOnboardingEnabled ? (
    <OnboardingModal
      onTrackEvent={onTrackEvent}
      images={images}
      visible={onboardingModalPopup && isOnboardingEnabled}
      onCancel={onCancel}
      onOk={onOk}
      logoType="CDF"
      {...modalTextProps}
    />
  ) : null;
};
