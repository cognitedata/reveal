import { PublishVersionModal } from './PublishVersionModal';
import { Wrapper } from '@platypus-app/components/Styles/storybook';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Basic Components/PublishVersionModal',
  component: PublishVersionModal,
};

export const FirstVersion = () => (
  <Wrapper>
    <PublishVersionModal
      versionType={'FIRST'}
      suggestedVersion={'1'}
      currentVersion={'1'}
      publishedVersions={[]}
      breakingChanges={''}
      onCancel={() => action('cancel')}
      onUpdate={() => action('update')}
      isUpdating={false}
      isSaving={false}
    />
  </Wrapper>
);

export const NonBreakingVersion = () => (
  <Wrapper>
    <PublishVersionModal
      versionType={'NON_BREAKING'}
      suggestedVersion={'2'}
      currentVersion={'2'}
      publishedVersions={[]}
      breakingChanges={''}
      onCancel={() => action('cancel')}
      onUpdate={() => action('update')}
      isUpdating={false}
      isSaving={false}
    />
  </Wrapper>
);

export const BreakingVersion = () => (
  <Wrapper>
    <PublishVersionModal
      versionType={'BREAKING'}
      suggestedVersion={'3'}
      currentVersion={'2'}
      publishedVersions={[]}
      breakingChanges={'* Field xyz changed or renamed.'}
      onCancel={() => action('cancel')}
      onUpdate={() => action('update')}
      isUpdating={false}
      isSaving={false}
    />
  </Wrapper>
);
