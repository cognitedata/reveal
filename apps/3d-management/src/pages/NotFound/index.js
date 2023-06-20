import React from 'react';
import { PageTitle } from '@cognite/cdf-utilities';
import Pages from './404Pages';

const NotFound = () => (
  <div>
    <PageTitle title="Not found" />
    <Pages />
  </div>
);

export default NotFound;
