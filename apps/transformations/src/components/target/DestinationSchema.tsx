import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import { useSchema } from '@transformations/hooks';
import {
  ConflictMode,
  Destination,
  TransformationRead,
} from '@transformations/types';

import { Flex, Colors, Detail, Icon } from '@cognite/cogs.js';

import SchemaItem from './SchemaItem';

type DestinationSchemaProps = {
  action: ConflictMode;
  destination: Destination;
  transformation: TransformationRead;
};

const DestinationSchema = ({
  action,
  destination,
  transformation,
}: DestinationSchemaProps): JSX.Element => {
  const { t } = useTranslation();
  const { data, isFetched } = useSchema({ destination, action });

  if (!isFetched) {
    return (
      <StyledSchemaContainer>
        <Icon type="Loader" />
      </StyledSchemaContainer>
    );
  }

  if (!data) {
    return (
      <StyledSchemaContainer>
        <StyledNoSchemaFound>{t('schema-not-found')}</StyledNoSchemaFound>
      </StyledSchemaContainer>
    );
  }

  return (
    <StyledSchemaContainer>
      {data.map((columnSchema) => {
        const { name } = columnSchema;

        return (
          <SchemaItem
            key={`${action}-${destination.type}-${name}`}
            schema={columnSchema}
            transformation={transformation}
          />
        );
      })}
    </StyledSchemaContainer>
  );
};

const StyledSchemaContainer = styled(Flex).attrs({ direction: 'column' })`
  gap: 12px;
  overflow-y: auto;
`;

const StyledNoSchemaFound = styled(Detail)`
  color: ${Colors['text-icon--muted']};
  line-height: 16px;
`;

export default DestinationSchema;
