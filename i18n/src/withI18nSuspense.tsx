import React, { ComponentType } from 'react';

import { I18nContainer } from './Provider';

type WithDisplayName = {
  displayName?: string;
};

export function withI18nSuspense<T extends {}>(
  Component:
    | ((() => JSX.Element | null) & WithDisplayName)
    | (((props: T) => JSX.Element | null) & WithDisplayName)
    | ComponentType<T>
) {
  const WithI18nContainer = (props: T) => {
    return (
      <I18nContainer>
        <Component {...props} />
      </I18nContainer>
    );
  };
  WithI18nContainer.displayName = `WithI18nSuspense(${
    Component.displayName || 'Anonymous'
  })`;
  return WithI18nContainer;
}
