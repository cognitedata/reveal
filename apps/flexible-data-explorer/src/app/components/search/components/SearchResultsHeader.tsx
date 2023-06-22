import styled from 'styled-components';

import { Body, Chip, Title } from '@cognite/cogs.js';

import { getIcon } from '../../../utils/getIcon';
import zIndex from '../../../utils/zIndex';

interface Props {
  title: string;
  description?: string;
}

export const SearchResultsHeader: React.FC<Props> = ({
  title,
  description,
}) => {
  return (
    <Container>
      <Chip icon={getIcon(title)} />
      <span>
        <Title level={6}>{title}</Title>
        {description && <Body>{description}</Body>}
      </span>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  padding: 16px 8px;
  gap: 16px;
  align-items: center;

  position: sticky;
  top: 0;
  background: linear-gradient(180deg, #fafafa 0%, rgba(243, 244, 248, 0) 100%);
  backdrop-filter: blur(8px);
  z-index: ${zIndex.PAGE_HEADER};
`;
