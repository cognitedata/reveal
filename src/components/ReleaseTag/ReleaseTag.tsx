import { Flex, Label } from '@cognite/cogs.js';
import { getReleaseState } from 'utils/utils';

type ReleaseTagProp = {
  version?: string;
};

const ReleaseTag = ({ version }: ReleaseTagProp) => {
  const releaseState = getReleaseState(version);

  return releaseState ? (
    <Flex gap={6} alignItems="center">
      <Label size="small">{releaseState}</Label>
    </Flex>
  ) : null;
};

export default ReleaseTag;
