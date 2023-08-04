import { StyleSheetManager } from 'styled-components';

// import { translations } from '@raw-explorer/common/i18n';
import RawExplorer from '@raw-explorer/containers/RawExplorer';
import { RawExplorerProvider } from '@raw-explorer/contexts';
import { AntStyles } from '@raw-explorer/styles/AntStyles';
import GlobalStyles from '@raw-explorer/styles/GlobalStyles';
import { setupMixpanel } from '@raw-explorer/utils/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// import { I18nWrapper } from '@cognite/cdf-i18n-utils';
// import { getEnv, getProject } from '@cognite/cdf-utilities';
import { SDKProvider, useSDK } from '@cognite/sdk-provider';

setupMixpanel();

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 10 * 60 * 1000,
      },
    },
  });

  // const appName = 'cdf-raw-explorer';
  // const projectName = getProject();
  // const env = getEnv();
  const sdk = useSDK();

  return (
    <StyleSheetManager
      disableVendorPrefixes={process.env.NODE_ENV === 'development'}
    >
      <SDKProvider sdk={sdk}>
        <QueryClientProvider client={queryClient}>
          <GlobalStyles>
            <AntStyles>
              <RawExplorerProvider>
                <RawExplorer />
              </RawExplorerProvider>
            </AntStyles>
          </GlobalStyles>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SDKProvider>
    </StyleSheetManager>
  );
};

export default App;
