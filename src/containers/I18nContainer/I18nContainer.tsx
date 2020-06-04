import React, { Suspense } from 'react';
import 'utils/i18n';

import SuspenseFallback from './SuspenseFallback';

type Props = {
  children: React.ReactNode;
};

/**
 * A container to wait for i18next to be initialized and configured. Note that
 * no user-visible strings should be above this component.
 */
const I18nContainer = ({ children }: Props) => {
  return <Suspense fallback={<SuspenseFallback />}>{children}</Suspense>;
};

export default I18nContainer;
