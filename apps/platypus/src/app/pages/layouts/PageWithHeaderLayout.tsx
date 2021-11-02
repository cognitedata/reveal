import styled from 'styled-components/macro';

type PageWithHeaderLayoutProps = {
  header: JSX.Element;
  children: JSX.Element;
};

export const PageWithHeaderLayout = ({
  header,
  children,
}: PageWithHeaderLayoutProps) => {
  return (
    <>
      <StyledHeader>{header}</StyledHeader>
      <StyledContent>{children}</StyledContent>
    </>
  );
};

const StyledHeader = styled.div`
  width: 100%;
  flex: 0;
`;

const StyledContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  font-size: 3rem;
  overflow: auto;
  position: relative;
  padding: 2rem;
  height: 100%;
`;
