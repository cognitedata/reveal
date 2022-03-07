import {
  ClassifierNavigationProps,
  NavigationBackButton,
  NavigationNextButton,
} from 'src/pages/Classifier/components/navigations/BottomNavigation';
import React from 'react';
import { useNavigation } from 'src/hooks/useNavigation';
import { useClassifierActions } from 'src/machines/classifier/hooks/useClassifierActions';

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
