import { Flex, Icon, Tooltip } from '@cognite/cogs.js';
import { FieldDefinitionNode } from 'graphql';
import styled from 'styled-components/macro';
import { TOOLTIP_DELAY } from '../../utils/config';
import {
  isFieldRequired,
  doesFieldHaveDirective,
} from '../../utils/graphql-utils';

export const PropertyAttributesDisplay = ({
  field,
}: {
  field: FieldDefinitionNode;
}) => {
  return (
    <Container gap={4}>
      <div>
        {isFieldRequired(field.type) ? (
          <Tooltip content="Required" delay={TOOLTIP_DELAY}>
            <Icon type="ExclamationMark" />
          </Tooltip>
        ) : (
          <></>
        )}
      </div>
      <div>
        {doesFieldHaveDirective(field, 'search') ? (
          <Tooltip content="Searchable" delay={TOOLTIP_DELAY}>
            <Icon type="Search" />
          </Tooltip>
        ) : (
          <></>
        )}
      </div>
      <div>
        {doesFieldHaveDirective(field, 'unique') ? (
          <Tooltip content="Unique" delay={TOOLTIP_DELAY}>
            <Icon type="Sun" />
          </Tooltip>
        ) : (
          <></>
        )}
      </div>
      <div>
        {doesFieldHaveDirective(field, 'index') ? (
          <Tooltip content="Indexed" delay={TOOLTIP_DELAY}>
            <Icon type="DataTable" />
          </Tooltip>
        ) : (
          <></>
        )}
      </div>
    </Container>
  );
};

const Container = styled(Flex)`
  && > div {
    background: var(--cogs-greyscale-grey2);
    color: var(--cogs-text-secondary);
    width: 24px;
    height: 24px;
    border-radius: 2px;
  }
  && > div,
  && > div > span {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
