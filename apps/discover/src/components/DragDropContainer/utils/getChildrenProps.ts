import * as React from 'react';

import compact from 'lodash/compact';

export const getChildrenProps = (children: React.ReactNode) => {
  return compact(
    React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return child.props;
      }
      return null;
    })
  );
};
