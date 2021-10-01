import styled from 'styled-components';
import z from 'utils/z';

export const Sidebar = styled.div`
  position: fixed;
  top: 0;
  left: -370px;
  bottom: 0;
  width: 370px;
  box-sizing: border-box;
  overflow: hidden;
  display: block;
  padding: 0 17px;
  z-index: ${z.MAXIMUM};
  background: white;
  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.08),
    0px 1px 4px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  transition: 0.3s;

  &.active {
    transition: 0.3s;
    left: 0;
  }
`;

export const SidebarHeader = styled.div`
  display: flex;
  overflow: hidden;
  height: 60px;
  line-height: 60px;
  font-size: 14px;
  color: #595959;
  font-weight: 600;
  position: relative;
  align-items: center;
}
`;

export const SidebarContentWrapper = styled.div`
  position: relative;
  height: calc(100% - 60px);
`;

export const ResultsWrapper = styled.div`
  position: absolute;
  top: 45px;
  bottom: 0;
  left: 0;
  right: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background: white;
  z-index: ${z.OVERLAY};
`;

export const Results = styled.div`
  padding-left: 24px;
  margin-top: 10px;
`;

export const SidebarInnerContentWrapper = styled.div`
  display: block;
  top: 0;
  position: absolute;
  background: #fff;
  width: 100%;
  bottom: 50px;
  overflow-x: hidden;
  overflow-y: auto;
`;

export const SidebarFooter = styled.div`
  display: block;
  overflow: hidden;
  border-top: 1px solid #d9d9d9;
  height: 50px;
  line-height: 50px;
  position: absolute;
  bottom: 0;
  width: 100%;
`;
