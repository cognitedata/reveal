import {
  Wrapper,
  MainTitle,
  MainDescription,
  GroupTitle,
  Group,
  List,
} from '../../../../components/Styles/storybook';

import { DataModels } from './dataModels.mock';
import { DataModelCard } from './DataModelCard';

export default {
  title: 'DataModels/DataModelCard',
  component: DataModelCard,
};

export const Base = () => (
  <Wrapper>
    <MainTitle>Data Model card represents the data model object.</MainTitle>
    <MainDescription title="Where is it used?">
      It can be found on the Data Models overview page as a list of data models.
    </MainDescription>
    <MainDescription title="Some secrets?">
      <List>
        <li>If there are no owners, nothing will be displayed.</li>
        <li>If version is empty, "1.0" will be displayed.</li>
      </List>
    </MainDescription>
    <Group>
      <GroupTitle>Default</GroupTitle>
      <DefaultDataModelCard />
    </Group>
    <Group>
      <GroupTitle>Data Model without owners and version</GroupTitle>
      <DataModelCardWithoutOwners />
    </Group>
  </Wrapper>
);

export const DefaultDataModelCard = () => (
  <DataModelCard
    dataModel={DataModels[0]}
    onOpen={() => false}
    onDelete={() => false}
    onEdit={() => false}
  />
);

export const DataModelCardWithoutOwners = () => (
  <DataModelCard
    dataModel={DataModels[1]}
    onOpen={() => false}
    onDelete={() => false}
    onEdit={() => false}
  />
);
