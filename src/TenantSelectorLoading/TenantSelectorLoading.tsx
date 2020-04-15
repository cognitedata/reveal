import React from 'react';

import { getSidecar } from 'utils';
import TenantSelectorContainer from '../TenantSelectorContainer';

type Props = {
  errorId?: string;
};

const TenantSelectorLoading = ({ errorId }: Props) => {
  const { applicationId } = getSidecar();

  const error = errorId ? (
    <>
      <div>Something is taking longer than usual. Please refresh the page.</div>
      <div>
        Contact{' '}
        <a href={`mailto:support@cognite.com?subject=Error ID: ${errorId}`}>
          support@cognite.com
        </a>{' '}
        if the problem persists.
      </div>
    </>
  ) : undefined;

  return (
    <TenantSelectorContainer
      applicationId={applicationId}
      authenticating
      error={error}
    />
  );
};

export default TenantSelectorLoading;
