/*********************************************
These styles are used in the storybook only
*********************************************/

import styled from 'styled-components';
import {
  StyledDescriptionTitle,
  StyledDescriptionWrapper,
  StyledGroupTitle,
  StyledMainTitle,
  StyledUnderline,
} from './elements';

export const Wrapper = styled.div`
  padding: 10px 15px 10px 15px;
`;

export const MainTitle = ({
  children,
}: {
  children: React.ReactNode | string;
}) => <StyledMainTitle level={3}>{children}</StyledMainTitle>;

export const MainDescription = ({
  children,
  title,
}: {
  children: React.ReactNode | string;
  title: string;
}) => (
  <StyledDescriptionWrapper>
    <StyledDescriptionTitle level={6}>{title}</StyledDescriptionTitle>
    {children}
  </StyledDescriptionWrapper>
);

export const Group = styled.div`
  margin: 20px 0 30px 0;
`;

export const GroupTitle = ({
  children,
}: {
  children: React.ReactNode | string;
}) => (
  <StyledGroupTitle level={5}>
    {children}
    <StyledUnderline />
  </StyledGroupTitle>
);

export const List = styled.ul`
  margin: 0;
  li {
    margin: 5px 0;
  }
`;
