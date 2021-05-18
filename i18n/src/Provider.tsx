import React, { Suspense } from 'react';

const SuspenseFallback = () => {
  return null; // <- might be nice to add cogs loader?
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
