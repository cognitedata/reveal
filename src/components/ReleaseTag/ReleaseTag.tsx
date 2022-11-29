import { Flex, Chip } from '@cognite/cogs.js';
import { getReleaseState } from 'utils/utils';

type ReleaseTagProp = {
  version?: string;
};

const ReleaseTag = ({ version }: ReleaseTagProp) => {
  const releaseState = getReleaseState(version);

  return releaseState ? (
    <Flex gap={6} alignItems="center">
      <Chip label={releaseState} size="x-small" />
    </Flex>
  ) : null;
};

export default ReleaseTag;
