import styled from 'styled-components';

const DocsLinkGrid = styled.div`
  display: grid;
  justify-content: space-between;
  gap: 24px;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
`;

export default DocsLinkGrid;
