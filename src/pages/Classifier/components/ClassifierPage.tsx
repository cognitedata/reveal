import React from 'react';
import { Page } from 'components/page';
import { ClassifierProps } from 'pages/Classifier/pages';
import { BottomNavigation } from 'pages/Classifier/components/navigations/BottomNavigation';
import { useBreadcrumb } from 'hooks/useBreadcrumb';

interface Props extends ClassifierProps {
  Navigation: JSX.Element | JSX.Element[];
}

export const CommonClassifierPage: React.FC<Props> = ({
  Navigation,
  Widget,
  children,
}) => {
  const { classifierPageBreadcrumbs } = useBreadcrumb();

  return (
    <Page
      Widget={Widget()}
      BottomNavigation={<BottomNavigation>{Navigation}</BottomNavigation>}
      breadcrumbs={classifierPageBreadcrumbs()}
    >
      {children}
    </Page>
  );
};
