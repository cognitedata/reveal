import {
  ClassifierNavigationProps,
  NavigationBackButton,
  NavigationNextButton,
} from 'apps/cdf-document-search/src/pages/Classifier/components/navigations/BottomNavigation';
import React from 'react';
import { useNavigation } from 'apps/cdf-document-search/src/hooks/useNavigation';
import { useClassifierActions } from 'apps/cdf-document-search/src/machines/classifier/hooks/useClassifierActions';

export const ManageTrainingSetNavigation: React.FC<
  ClassifierNavigationProps
> = ({ disabled }) => {
  const { goBack } = useNavigation();
  const { nextPage } = useClassifierActions();

  return (
    <>
      <NavigationBackButton onClick={() => goBack()}>
        Go home
      </NavigationBackButton>
      <NavigationNextButton disabled={disabled} onClick={() => nextPage()}>
        Train classifier
      </NavigationNextButton>
    </>
  );
};
