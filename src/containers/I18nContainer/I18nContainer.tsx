import React, { Suspense } from 'react';
import 'utils/i18n';

import { useTranslation } from 'react-i18next';
import SuspenseFallback from './SuspenseFallback';

type Props = {
  children: React.ReactNode;
};

const Nested = ({ children }: Props) => {
  const { t } = useTranslation('global');

  return (
    <>
      <h1>{t('helloWorld', { defaultValue: 'Hello world' })}</h1>
      {children}
    </>
  );
};

/**
 * A container to wait for i18next to be initialized and configured. Note that
 * no user-visible strings should be above this component.
 */
const I18nContainer = ({ children }: Props) => {
  return (
    <Suspense fallback={<SuspenseFallback />}>
      <Nested>{children}</Nested>
    </Suspense>
  );
};

export default I18nContainer;
