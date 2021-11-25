import styled from 'styled-components';

export const SvgViewerWrapper = styled.div`
  height: calc(100% - 56px);
  overflow: hidden;
`;

export const ReactSVGWindow = styled.div`
  position: relative;
`;

export const ReactSVGWrapper = styled.div`
  height: 100%;
  overflow: scroll;
  border: 2px solid;
`;

export const ZoomButtonsWrapper = styled.div`
  position: absolute;
  bottom: 1rem;
  transform: translate(-50%, 0);
  left: 50%;
`;

export const ModalFooterWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, max-content);
  justify-content: end;
  gap: 1rem;
`;
