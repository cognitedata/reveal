import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  InternalStep,
  OnboardingModal,
  useOrientation,
} from '@fusion/shared/user-onboarding-components';
import useLocalStorageState from 'use-local-storage-state';

import { useFlag } from '@cognite/react-feature-flags';

import image1 from '../../images/carousel-image_1.png';
import image2 from '../../images/carousel-image_2.png';
import image3 from '../../images/carousel-image_3.png';

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
        target: '.navigation-bar',
        title: t('ORIENTATION_TOOLTIP_TITLE_1'),
        description: t('ORIENTATION_TOOLTIP_DESCRIPTION_1'),
        icon: 'BarOver',
      },
      {
        target: '.user-menu',
        title: t('ORIENTATION_TOOLTIP_TITLE_2'),
        description: t('ORIENTATION_TOOLTIP_DESCRIPTION_2'),
        icon: 'UserSuccess',
      },
      {
        target: '.search-bar-container',
        title: t('ORIENTATION_TOOLTIP_TITLE_3'),
        description: t('ORIENTATION_TOOLTIP_DESCRIPTION_3'),
        icon: 'Search',
      },
    ],
    [t]
  );
  const [onboardingModalPopup, setOnboardingModalPopup] =
    useLocalStorageState<boolean>('onboarding-modal-popup', {
      defaultValue: true,
    });

  const { handleState } = useOrientation();

  const onCancel = () => {
    setOnboardingModalPopup(false);
  };
  const onOk = () => {
    handleState({ open: true, steps });
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
      images={images}
      visible={onboardingModalPopup}
      onCancel={onCancel}
      onOk={onOk}
      logoType="CDF"
      {...modalTextProps}
    />
  ) : null;
};
