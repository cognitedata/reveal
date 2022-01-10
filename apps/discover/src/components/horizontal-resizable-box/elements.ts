import styled from 'styled-components/macro';
import layers from 'utils/zindex';

export const ResizeHandle = styled.div`
  position: absolute;
  width: 12px;
  height: 100%;
  top: 0;
  right: -6px;
  z-index: ${layers.RESIZE_BAR};
  border-left: none;
  overflow: hidden;
  cursor: col-resize;
  background-image: url("data:image/svg+xml,%3Csvg width='5' height='32' viewBox='0 0 5 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.11821 28.1765C5.25075 28.2732 5.37888 28.3718 5.5 28.4719V26V6V3.52815C5.37888 3.62816 5.25075 3.7268 5.11821 3.82354C4.39437 4.35188 3.46579 4.87609 2.62208 5.31184C1.34426 5.9718 0.5 7.24869 0.5 8.64811V23.3519C0.5 24.7513 1.34426 26.0282 2.62208 26.6882C3.46579 27.1239 4.39437 27.6481 5.11821 28.1765Z' fill='%23E8E8E8' stroke='white'/%3E%3Crect width='1' height='8' rx='0.5' transform='matrix(-1 0 0 1 4 12)' fill='%23595959'/%3E%3C/svg%3E%0A");
  background-position: 1px center;
  background-repeat: no-repeat;
`;
