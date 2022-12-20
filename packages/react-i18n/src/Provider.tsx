import { PropsWithChildren, Suspense } from 'react';
import { Loader } from '@cognite/cogs.js';

/**
 * A container to wait for i18next to be initialized and configured. Note that
 * no user-visible strings should be above this component.
 */
export const I18nContainer = ({ children }: PropsWithChildren) => (
  <Suspense
    fallback={<Loader infoTitle="Loading Translations" darkMode={false} />}
  >
    {children}
  </Suspense>
);
