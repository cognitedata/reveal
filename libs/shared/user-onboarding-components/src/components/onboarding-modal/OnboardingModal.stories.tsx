import { ComponentStory } from '@storybook/react';

import { A, Body } from '@cognite/cogs.js';

import image1 from './carousel-image_1.png';
import image2 from './carousel-image_2.png';
import image3 from './carousel-image_3.png';
import { OnboardingModal } from './OnboardingModal';

export default {
  title: 'Shared/OnboardingComponents/OnboardingModal',
  component: OnboardingModal,
};

export const Basic: ComponentStory<typeof OnboardingModal> = (args) => {
  const images = [
    {
      image: image1,
      title: 'All OF YOUR DATA IN ONE PLACE',
      subtitle: 'Increase your workflow efficiency with Cognite AI',
    },
    {
      image: image2,
      title: 'Search and explore',
      subtitle: 'Explore your data and discover new insights',
    },
    {
      image: image3,
      title: 'Cognite Data explorer',
      subtitle: 'Find your data in quick and easy way',
    },
  ];

  const headerText =
    'There are many tools in Cognite Data Fusion.\n Explore more in the product tour or in our ';
  return (
    <OnboardingModal
      visible
      body={
        <Body style={{ width: '50%', textAlign: 'center' }} level={3}>
          {headerText}
          <A href="#">online docs</A>.
        </Body>
      }
      {...args}
      images={images}
    ></OnboardingModal>
  );
};
