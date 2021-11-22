import {
  ClassifierNavigationProps,
  NavigationBackButton,
  NavigationNextButton,
} from 'pages/Classifier/components/navigations/BottomNavigation';
import React from 'react';
import { useNavigation } from 'hooks/useNavigation';
import { useClassifierActions } from 'machines/classifier/hooks/useClassifierActions';

export const ManageTrainingSetNavigation: React.FC<ClassifierNavigationProps> =
  () => {
    const { goBack } = useNavigation();
    const { nextPage } = useClassifierActions();

    return (
      <>
        <NavigationBackButton onClick={() => goBack()}>
          Go home
        </NavigationBackButton>
        <NavigationNextButton onClick={() => nextPage()}>
          Train classifier
        </NavigationNextButton>
      </>
    );
  };
