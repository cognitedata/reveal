import type { Meta } from '@storybook/react';

import { ResponsiveActions } from './ResponsiveActions';

const Story: Meta<typeof ResponsiveActions> = {
  component: ResponsiveActions,
  title: 'Components/ResponsiveActions',
};
export default Story;

export const Default = () => {
  return (
    <ResponsiveActions
      actions={[{ content: 'Action 1', onClick: console.log }]}
    />
  );
};
export const ManyActions = () => {
  return (
    <ResponsiveActions
      actions={[
        { content: 'Action 1', onClick: console.log },
        { content: 'Action 2', onClick: console.log },
        { content: 'Action 3', onClick: console.log },
        { content: 'Action 4', onClick: console.log },
        { content: 'Action 5', onClick: console.log },
        { content: 'Action 6', onClick: console.log },
        { content: 'Action 7', onClick: console.log },
        { content: 'Action 8', onClick: console.log },
        { content: 'Action 9', onClick: console.log },
        { content: 'Action 10', onClick: console.log },
        { content: 'Action 11', onClick: console.log },
        { content: 'Action 12', onClick: console.log },
        { content: 'Action 13', onClick: console.log },
        { content: 'Action 14', onClick: console.log },
        { content: 'Action 15', onClick: console.log },
        { content: 'Action 16', onClick: console.log },
      ]}
    />
  );
};
