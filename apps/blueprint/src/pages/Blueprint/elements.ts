import styled from 'styled-components/macro';
import z from 'utils/z';

export const PageWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
`;

export const TopLeft = styled.div`
  top: 68px;
  left: 8px;
  position: absolute;
  display: flex;
  z-index: ${z.BLUEPRINT_PAGE_TOPBAR};
`;

export const TopRight = styled.div`
  top: 68px;
  right: 8px;
  position: absolute;
  display: flex;
  gap: 8px;
  z-index: ${z.BLUEPRINT_PAGE_TOPBAR};
`;

export const FullScreenOverlay = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.6);
  z-index: ${z.MAXIMUM};
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
`;
