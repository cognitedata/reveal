import styled from 'styled-components/macro';
import layers from '_helpers/zindex';

export const SidebarContainer = styled.div<{
  open?: boolean;
}>`
  position: fixed;
  height: 100%;
  width: 298px;
  box-shadow: var(--cogs-z-12);
  padding: 16px 24px;
  z-index: ${layers.LEFT_SIDEBAR};
  background: var(--cogs-white);
  transform: ${({ open }) => (open ? 'translateX(0)' : 'translateX(-100%)')};
  transition: transform 0.3s ease-in-out;
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
    background-color: var(--cogs-midblue-8);
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
