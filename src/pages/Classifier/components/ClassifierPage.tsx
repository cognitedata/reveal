import React from 'react';
import { Page } from 'src/components/page';
import { ClassifierProps } from 'src/pages/Classifier/pages';
import { BottomNavigation } from 'src/pages/Classifier/components/navigations/BottomNavigation';
import { useBreadcrumb } from 'src/hooks/useBreadcrumb';
import { useClassifierName } from 'src/hooks/useClassifierName';

interface Props extends ClassifierProps {
  Navigation: JSX.Element | JSX.Element[];
}

export const CommonClassifierPage: React.FC<Props> = ({
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
