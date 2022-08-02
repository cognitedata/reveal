import { CogniteSDKPage } from './CogniteSDK';

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  title: 'CogniteSDK',
};

export const Base = () => (
  <CogniteSDKPage
    client={{
      // @ts-expect-error missing props
      login: { status: () => Promise.resolve(null) },
    }}
  />
);
