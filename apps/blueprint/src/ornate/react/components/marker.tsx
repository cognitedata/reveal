import styled from 'styled-components';

export const Marker = styled.div<{ bottom?: boolean }>`
  padding: 4px 8px;
  background: var(--cogs-primary);
  font-weight: bold;
  color: white;
  transform: translate(-50%, -102%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  &:after {
    content: '';
    width: 8px;
    height: 8px;
    background: var(--cogs-primary);
    position: absolute;
    left: 50%;
    bottom: -6px;
    transform: rotate(45deg) translateX(-50%);
  }
  ${(props) =>
    props.bottom &&
    `
  transform: translate(-50%, 5%);
  &:after {
    display: none;
  }
`}
`;
