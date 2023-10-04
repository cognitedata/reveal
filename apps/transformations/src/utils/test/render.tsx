import * as React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { cluster, user, project } from '@transformations/__fixtures__';
import { translations } from '@transformations/common';
import { styleScope } from '@transformations/styles/styleScope';
import { UserHistoryProvider } from '@user-history';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk from '@cognite/cdf-sdk-singleton';
import { SDKProvider } from '@cognite/sdk-provider';

export default (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'queries'>
) => {
  // This is where you can wrap your rendered UI component in redux stores,
  // providers, or anything else you might want.

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000,
      },
    },
  });

  const component = (
    <div className={styleScope}>
      <I18nWrapper
        translations={translations}
        defaultNamespace="transformations"
      >
        <QueryClientProvider client={queryClient}>
          <SDKProvider sdk={sdk}>
            <UserHistoryProvider
              cluster={cluster}
              project={project}
              userId={user}
            >
              {ui}
            </UserHistoryProvider>
          </SDKProvider>
        </QueryClientProvider>
      </I18nWrapper>
    </div>
  );

  return render(component, options);
};
