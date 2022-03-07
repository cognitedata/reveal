import { Button, Flex } from '@cognite/cogs.js';
import { useNavigation } from 'src/hooks/useNavigation';
import { useClassifierActions } from 'src/machines/classifier/hooks/useClassifierActions';
import {
  ClassifierNavigationProps,
  NavigationBackButton,
  NavigationNextButton,
} from 'src/pages/Classifier/components/navigations/BottomNavigation';
import React from 'react';

interface Props extends ClassifierNavigationProps {
  onDeployClick: () => void;
}
export const ReviewModelNavigation: React.FC<Props> = ({ onDeployClick }) => {
  const { previousPage } = useClassifierActions();
  const { toHome } = useNavigation();

  return (
    <>
      <NavigationBackButton onClick={() => previousPage()}>
        Back
      </NavigationBackButton>
      <Flex gap={8}>
        <Button onClick={() => toHome()}>Go home</Button>
        <NavigationNextButton type="primary" onClick={() => onDeployClick()}>
          Deploy model
        </NavigationNextButton>
      </Flex>
    </>
  );
};
