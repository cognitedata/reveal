import { Flex, Icon, Tooltip } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { FieldSchemaDirectiveType } from '../../types';

const TOOLTIP_DELAY = 500;

const MAX_LENGTH = 3; // Maximum directives boxes to display

export const FieldDirectiveDisplay = ({
  directives = [],
}: {
  directives?: FieldSchemaDirectiveType[];
}) => {
  return (
    <Container gap={4}>
      {directives.map((directive) => (
        <div key={directive.name}>
          <Tooltip content={directive.name} delay={TOOLTIP_DELAY}>
            <Icon type={directive.icon} />
          </Tooltip>
        </div>
      ))}
      {/* FILL REST OF DIRECTIVES BOXES BASED ON INITIAL LENGTH OF VALUES */}
      {Array.from({ length: MAX_LENGTH - directives.length }).map((_, i) => (
        <div key={i} />
      ))}
    </Container>
  );
};

const Container = styled(Flex)`
  && > div {
    background: var(--cogs-greyscale-grey2);
    color: var(--cogs-text-secondary);
    width: 24px;
    height: 24px;
    border-radius: 4px;
    padding: 4px;
  }
  && > div,
  && > div > span {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;
