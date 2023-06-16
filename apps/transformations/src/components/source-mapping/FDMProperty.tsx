import {
  ConnectionDefinition,
  ViewPropertyDefinition,
} from '@transformations/hooks/fdm';

import { Flex } from '@cognite/cogs.js';

type Props = {
  name: string;
  spec: ViewPropertyDefinition | ConnectionDefinition;
};

function Type({ spec }: Pick<Props, 'spec'>) {
  switch (spec.type?.type) {
    case undefined: {
      return <div>{(spec as ConnectionDefinition).source.externalId}</div>;
    }
    case 'boolean':
    case 'float32':
    case 'float64':
    case 'int32':
    case 'int64':
    case 'timestamp':
    case 'date':
    case 'json':
    case 'text': {
      return (
        <div>
          {spec.type?.type}
          {spec.type.list ? '[]' : null}
        </div>
      );
    }
    default: {
      return null;
    }
  }
}

export default function FDMProperty({ name, spec }: Props) {
  return (
    <Flex justifyContent="space-between">
      <div>{name}</div>
      <Type spec={spec} />
    </Flex>
  );
}
