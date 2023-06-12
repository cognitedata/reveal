import React from 'react';
import { Page } from 'apps/cdf-document-search/src/components/page';
import { ClassifierProps } from 'apps/cdf-document-search/src/pages/Classifier/pages';
import { BottomNavigation } from 'apps/cdf-document-search/src/pages/Classifier/components/navigations/BottomNavigation';
import { useBreadcrumb } from 'apps/cdf-document-search/src/hooks/useBreadcrumb';
import { useClassifierName } from 'apps/cdf-document-search/src/hooks/useClassifierName';

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
