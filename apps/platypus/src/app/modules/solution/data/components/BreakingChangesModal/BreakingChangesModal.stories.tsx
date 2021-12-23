import { BreakingChangesModal } from './BreakingChangesModal';
import { Wrapper } from '@platypus-app/components/Styles/storybook';

export default {
  title: 'Components / BreakingChangesModal',
  component: BreakingChangesModal,
};

export const Base = () => (
  <Wrapper>
    <BreakingChangesModal
      onCancel={() => console.log('cancel')}
      onUpdate={() => console.log('update')}
      breakingChanges={'There are breaking changes!'}
      isUpdating={false}
    />
  </Wrapper>
);
