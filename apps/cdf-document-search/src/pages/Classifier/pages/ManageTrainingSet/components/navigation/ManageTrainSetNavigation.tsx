import React from 'react';

import { useNavigation } from '../../../../../../hooks/useNavigation';
import { useClassifierActions } from '../../../../../../machines/classifier/hooks/useClassifierActions';
import {
  ClassifierNavigationProps,
  NavigationBackButton,
  NavigationNextButton,
} from '../../../../components/navigations/BottomNavigation';

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
