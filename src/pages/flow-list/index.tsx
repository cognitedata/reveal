import { Flex } from '@cognite/cogs.js';
import RawSetupCheck from './SetupCheck';
import List from './List';
import CreateButton from './CreateButton';

type Props = {};

export default function FlowList({}: Props) {
  return (
    <RawSetupCheck>
      <Flex justifyContent="space-between">
        <h1>Flow list</h1>
        <CreateButton />
      </Flex>
      <List />
    </RawSetupCheck>
  );
}
