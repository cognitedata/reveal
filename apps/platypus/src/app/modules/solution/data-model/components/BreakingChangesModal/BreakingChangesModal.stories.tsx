import { action } from '@storybook/addon-actions';

import { Wrapper } from '../../../../../components/Styles/storybook';

import { BreakingChangesModal } from './BreakingChangesModal';

export default {
  title: 'Basic Components/BreakingChangesModal',
  component: BreakingChangesModal,
};

export const Base = () => (
  <Wrapper>
    <BreakingChangesModal
      onCancel={() => action('cancel')}
      onUpdate={() => action('update')}
      breakingChanges="There are breaking changes!"
      isUpdating={false}
    />
  </Wrapper>
);
