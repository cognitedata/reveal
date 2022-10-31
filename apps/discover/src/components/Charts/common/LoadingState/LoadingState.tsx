import * as React from 'react';

import { Loading } from 'components/Loading';

import { LoadingStateWrapper } from './elements';

export const LoadingState: React.FC = () => {
  return (
    <LoadingStateWrapper>
      <Loading loadingSubtitle="Loading..." />
    </LoadingStateWrapper>
  );
};
