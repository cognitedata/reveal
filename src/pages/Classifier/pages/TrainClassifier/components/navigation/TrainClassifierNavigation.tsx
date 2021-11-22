import { useClassifierActions } from 'machines/classifier/hooks/useClassifierActions';
import {
  ClassifierNavigationProps,
  NavigationBackButton,
  NavigationNextButton,
} from 'pages/Classifier/components/navigations/BottomNavigation';
import React from 'react';

export const TrainClassifierNavigation: React.FC<ClassifierNavigationProps> = ({
  disabled,
}) => {
  const { previousPage, nextPage } = useClassifierActions();

  return (
    <>
      <NavigationBackButton onClick={() => previousPage()}>
        Back
      </NavigationBackButton>
      <NavigationNextButton
        type="primary"
        disabled={disabled}
        onClick={() => nextPage()}
      >
        Review model
      </NavigationNextButton>
    </>
  );
};
