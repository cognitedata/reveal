import React from 'react';
import { makeDefaultTranslations } from 'utils/translations';

const defaultTranslations = makeDefaultTranslations(
  'New monitoring job',
  'Start monitoring',
  'Cancel',
  'Next',
  'Back',
  'Unable to create Session Nonce'
);

/**
 * Temporarily disabling, this file will be updated in the other PR
 */
/* eslint-disable @typescript-eslint/no-unused-vars-experimental */
type Props = {
  translations?: typeof defaultTranslations;
  onCancel: () => void;
  onViewMonitoringJob: () => void;
};

const CreateMonitoringJob = ({
  translations,
  onCancel,
  onViewMonitoringJob,
}: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };

  return <></>;
};

export default CreateMonitoringJob;
