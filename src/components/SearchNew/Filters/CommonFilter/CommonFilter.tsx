import React from 'react';
import { BaseFilterCollapse } from '../BaseFilterCollapse/BaseFilterCollapse';

export const CommonFilter = ({ ...rest }) => {
  return (
    <BaseFilterCollapse.Panel title="Common" {...rest}>
      <p>Coming soon</p>
    </BaseFilterCollapse.Panel>
  );
};
