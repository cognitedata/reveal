import React, { Suspense, useEffect } from 'react';
export { useTranslation, Trans } from 'react-i18next';
import { Metrics, useMetrics } from '@cognite/metrics';

const SuspenseFallback = () => {
  const metrics = useMetrics('I18NLoader');

  useEffect(() => {
    const timer = metrics.start('startLoading');
    return () => Metrics.stop(timer);
  }, []);

  return null;
};

type Props = {
  children: React.ReactNode;
};

/**
 * A container to wait for i18next to be initialized and configured. Note that
 * no user-visible strings should be above this component.
 */
export const I18nContainer = ({ children }: Props) => {
  return <Suspense fallback={<SuspenseFallback />}>{children}</Suspense>;
};
