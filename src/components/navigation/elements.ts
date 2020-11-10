import styled from 'styled-components/macro';
import layers from '_helpers/zindex';

export const SidebarContainer = styled.div`
  position: fixed;
  height: 100%;
  width: 258px;
  box-shadow: 0px 5px 16px rgba(0, 0, 0, 0.04),
    0px 10px 24px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  z-index: ${layers.LEFT_SIDEBAR};
  background: var(--cogs-white);
`;

export const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 22px;
  margin-bottom: 10px;
`;

export const SuiteTitle = styled.span`
  color: ${(props: { disabled?: boolean }) =>
    props.disabled ? 'var(--cogs-greyscale-grey6)' : 'var(--cogs-black)'};
  margin-left: 8px;
`;

export const NavigationItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 4px;

  &:hover {
    cursor: pointer;
    background-color:  var(--cogs-midblue-8);
    border-radius: 4px;
  }
`;

export const AvailableSuitesContainer = styled.div`
  padding-bottom: 22px;
`;

export const UnAvailableSuitesContainer = styled.div`
  border-top: 1px solid var(--cogs-greyscale-grey4);
  padding-top: 22px;
`;
