import {
  Wrapper,
  MainTitle,
  MainDescription,
  GroupTitle,
  Group,
  List,
} from '../../../../components/Styles/storybook';

import { Solutions } from './solutions.mock';
import { SolutionCard } from './SolutionCard';

export default {
  title: 'Solutions/SolutionCard',
  component: SolutionCard,
};

export const Base = () => (
  <Wrapper>
    <MainTitle>Solution card represents the solution object.</MainTitle>
    <MainDescription title="Where is it used?">
      It can be found on the Solution overview page as a list of solutions.
    </MainDescription>
    <MainDescription title="Some secrets?">
      <List>
        <li>If there are no owners, nothing will be displayed.</li>
        <li>If version is empty, "1.0" will be displayed.</li>
      </List>
    </MainDescription>
    <Group>
      <GroupTitle>Default</GroupTitle>
      <DefaultSolutionCard />
    </Group>
    <Group>
      <GroupTitle>Solution without owners and version</GroupTitle>
      <SolutionCardWithoutOwners />
    </Group>
  </Wrapper>
);

export const DefaultSolutionCard = () => (
  <SolutionCard
    solution={Solutions[0]}
    onOpen={() => false}
    onDelete={() => false}
    onEdit={() => false}
  />
);

export const SolutionCardWithoutOwners = () => (
  <SolutionCard
    solution={Solutions[1]}
    onOpen={() => false}
    onDelete={() => false}
    onEdit={() => false}
  />
);
