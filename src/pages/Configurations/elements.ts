import styled from 'styled-components';

export const ConfigurationsMainContainer = styled.div`
  display: block;
`;

export const ConnectionLinesWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  pointer-events: none;

  #connectorLinesSvg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100vh;
    pointer-events: none;

    .connectorLine {
      stroke-width: 2px;
      stroke: var(--cogs-midblue);
      stroke-linecap: round;
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      animation: dash 2s 0.5s linear forwards;
    }
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0;
    }
  }
`;

export const ContentContainer = styled.div`
  background-color: var(--cogs-white);
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.1);
  margin-top: 16px;
`;

export const ContentCard = styled(ContentContainer)`
  border-radius: 16px;
  padding: 24px 32px;
`;

export const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
`;

export const ThreeColsLayout = styled.div`
  display: flex;
  & > div {
    width: calc(100% / 3);
    min-height: 50vh;
  }
`;

export const ConfigurationContainer = styled(ContentCard)`
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  & > header {
    border-bottom: 1px solid var(--cogs-greyscale-grey5);
    padding: 24px 48px;
  }
  & > main {
    padding: 16px 48px;
    flex-grow: 1;
  }
  & > footer {
    padding: 16px 48px;
    display: flex;
    justify-content: center;
  }
`;

export const ConfigurationArrow = styled.div`
  padding: 48px;
  display: flex;
  justify-content: center;
  & > svg {
    width: 75%;
    stroke: var(--cogs-greyscale-grey5);
  }
`;

export const InitialState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  & > p {
    font-weight: bold;
    color: var(--cogs-greyscale-grey5);
  }
`;

export const ConnectorList = styled.ul<{
  connectorPosition?: string;
  connected?: boolean;
}>`
  list-style: none;
  margin: 0;
  padding: 0;
  & > li {
    background-color: var(--cogs-greyscale-grey2);
    border-radius: 16px;
    margin-bottom: 16px;
    padding: 4px 16px;
    position: relative;

    .connectorPoint,
    .connectorTarget {
      position: absolute;
      right: ${(props) =>
        props.connectorPosition === 'right' ? '-32px' : 'calc(100% + 16px)'};
      top: calc(50% - 10px);
      background-color: ${(props) =>
        props.connected
          ? 'var(--cogs-midblue)'
          : 'var(--cogs-greyscale-grey2)'};
      border-radius: 50%;
      width: 10px;
      height: 10px;
      border: 4px solid var(--cogs-greyscale-grey2);
      box-sizing: content-box;
      transition: background-color 0.3s ease;
    }
  }
`;
