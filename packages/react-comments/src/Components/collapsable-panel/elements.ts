import styled from 'styled-components';

interface SidePanelProps {
  visible: boolean;
  width: number;
}

interface CenterPanelProps {
  left?: number | false;
  right?: number | false;
}

export const Container = styled.div`
  flex-direction: row;
  position: relative;
  width: 100%;
  height: 100%;
`;

const Panel = styled.div`
  position: absolute;
  top: 0;
  min-height: 100%;
  overflow: hidden;
  transition: width var(--cogs-transition-time),
    transform var(--cogs-transition-time);
  width: ${(props: SidePanelProps) => props.width}px;
`;

export const CenterPanel = styled.div<CenterPanelProps>`
  position: absolute;
  top: 0;
  left: ${(props: CenterPanelProps) => props.left || 0}px;
  right: ${(props: CenterPanelProps) => props.right || 0}px;
  min-height: 100%;
  overflow: hidden;

  transition: left var(--cogs-transition-time),
    right var(--cogs-transition-time), border var(--cogs-transition-time);
`;

export const PanelContent = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  max-height: 100%;
  overflow-x: hidden;

  transition: transform var(--cogs-transition-time);
`;

export const LeftPanel = styled(Panel)<SidePanelProps>`
  left: 0;

  border-right: 1px solid
    ${(props: SidePanelProps) =>
      props.visible ? 'var(--cogs-greyscale-grey3)' : 'transparent'};

  width: ${(props: SidePanelProps) => (props.visible ? props.width : 0)}px;

  ${PanelContent} {
    width: ${(props: SidePanelProps) => props.width}px;

    transform: translateX(
      ${(props: SidePanelProps) => (props.visible ? '0' : '95%')}
    );
  }
`;

export const RightPanel = styled(Panel)<SidePanelProps>`
  right: 0;
  border-left: 1px solid
    ${(props: SidePanelProps) =>
      props.visible ? 'var(--cogs-greyscale-grey3)' : 'transparent'};
  width: ${(props: SidePanelProps) => (props.visible ? props.width : 0)}px;

  ${PanelContent} {
    width: ${(props: SidePanelProps) => props.width}px;

    transform: translateX(
      ${(props: SidePanelProps) => (props.visible ? '0' : '5%')}
    );
  }
`;
