import styled from 'styled-components';

export const AllTab = () => {
  return (
    <AllTabContainer>
      <span>Assets</span>
      <span>Time series</span>
      <span>Documents</span>
      <span>Events</span>
      <span>Sequences</span>
    </AllTabContainer>
  );
};

const AllTabContainer = styled.div`
  height: 300px;
  padding: 16px;
  display: grid;
  grid-template-columns: auto auto;
`;
