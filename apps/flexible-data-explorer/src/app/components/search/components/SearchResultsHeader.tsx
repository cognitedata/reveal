import styled from 'styled-components';

import { Body, Title } from '@cognite/cogs.js';

import { getIcon } from '../../../utils/getIcon';
import zIndex from '../../../utils/zIndex';
import { CategoryChip } from '../../chips/CategoryChip';

interface Props {
  title: string;
  description?: string;
}

export const SearchResultsHeader: React.FC<React.PropsWithChildren<Props>> = ({
  children,
  title,
  description,
}) => {
  return (
    <Container>
      <CategoryChip icon={getIcon(title)} />
      <span>
        <Title level={6}>{title}</Title>
        {description && <Body>{description}</Body>}
      </span>
      <Actions>{children}</Actions>
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
  background: linear-gradient(180deg, #f8f9fc 0%, rgba(243, 244, 248, 0) 100%);
  backdrop-filter: blur(8px);
  z-index: ${zIndex.PAGE_HEADER};
`;

const Actions = styled.div`
  margin-left: auto;
  display: flex;
  flex-direction: row-reverse;
  gap: 8px;
`;
