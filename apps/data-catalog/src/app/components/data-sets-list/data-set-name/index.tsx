import Link from '@data-catalog-app/components/Link';
import { createInternalLink } from '@data-catalog-app/utils/shared';
import { DataSetV3 } from '@data-catalog-app/utils/types';

import { Body, Flex, Icon } from '@cognite/cogs.js';

type DataSetNameProps = Pick<
  DataSetV3,
  'id' | 'name' | 'externalId' | 'writeProtected'
>;

const DataSetName = ({
  externalId,
  name,
  id,
  writeProtected,
}: DataSetNameProps): JSX.Element => {
  return (
    <Body level={2} strong>
      <Flex alignItems="center" gap={4}>
        {writeProtected ? <Icon type="Lock" /> : <></>}
        <Link to={createInternalLink(`data-set/${id}`)}>
          {name ?? externalId ?? id}
        </Link>
      </Flex>
    </Body>
  );
};

export default DataSetName;
