import React from 'react';

import { Page } from '../../../components/page';
import { useBreadcrumb } from '../../../hooks/useBreadcrumb';
import { useClassifierName } from '../../../hooks/useClassifierName';
import { ClassifierProps } from '../pages';

import { BottomNavigation } from './navigations/BottomNavigation';

interface Props extends ClassifierProps {
  Navigation: JSX.Element | JSX.Element[];
}

export const CommonClassifierPage: React.FC<React.PropsWithChildren<Props>> = ({
  Navigation,
  Widget,
  children,
}) => {
  const { classifierName } = useClassifierName();
  const { classifierPageBreadcrumbs } = useBreadcrumb();

  return (
    <Page
      Widget={Widget()}
      BottomNavigation={<BottomNavigation>{Navigation}</BottomNavigation>}
      breadcrumbs={classifierPageBreadcrumbs(classifierName)}
    >
      {children}
    </Page>
  );
};
