import Logo from 'images/DiscoverLogo.svg';

import { FlexGrow, FlexRow, Center } from 'styles/layout';

import { Typography } from '../typography';

import { Card } from './Card';

export default {
  title: 'Components / Card',
  component: Card,
};

export const simple = () => (
  <Card title="This is a base card" text="Lorem ipsum dol or at" />
);

export const withContent = () => (
  <Card title="This is a base card" text="Lorem ipsum dolor at">
    <FlexRow>
      <div>
        <Typography>Members!</Typography>
      </div>
      <FlexGrow />
      <div>
        <Typography>Assets</Typography>
      </div>
    </FlexRow>
    <Center>
      <img src={Logo} alt="Logo" />
    </Center>
  </Card>
);
