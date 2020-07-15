import React, { Suspense, useEffect } from 'react';
export { useTranslation, Trans } from 'react-i18next';
import { useMetrics } from '@cognite/metrics';

const SuspenseFallback = () => {
  const metrics = useMetrics('I18NLoader');

  useEffect(() => {
    const loader = metrics.start('startLoading');
    return loader.stop;
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
