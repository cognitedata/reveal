import {
  Group,
  MainDescription,
  MainTitle,
  Wrapper,
} from '@platypus-app/components/Styles/storybook';
import { mockComplexGraphqlModel } from '@platypus-app/mocks/graphqlModels';
import { initialState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import configureStory from '@platypus-app/tests/configureStorybook';
import { UIEditor } from './UIEditor';

export default {
  title: 'Schema/UIEditor',
  component: UIEditor,
};

export const Default = () => {
  return (
    <Wrapper>
      <MainTitle>UIEditor</MainTitle>
      <MainDescription title="Where is it used?">
        Component for Creating data model without writing code.
        <br />
        This component is used on Solution/Data Model page.
      </MainDescription>
      <Group>
        <div style={{ height: '600px' }}>
          <UIEditor builtInTypes={[]} disabled={false} />
        </div>
      </Group>
    </Wrapper>
  );
};

Default.story = configureStory({
  redux: {
    dataModel: {
      ...initialState,
      graphQlSchema: mockComplexGraphqlModel,
    },
  },
});
