import styled from 'styled-components';

export const Content = styled.section`
  display: flex;
  align-items: center;
  padding: 16px;
`;

export const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background: var(--cogs-surface--misc-canvas);
  padding: 8px;
  height: 156px;
  background-image: radial-gradient(
    circle at 1px 1px,
    lightgrey 1px,
    transparent 0
  );
  background-size: 40px 30px;
`;

export const SelectedText = styled.div<{ $color: string }>`
  border: 2px solid ${(props) => props.$color};
  display: inline-block;
  white-space: pre;
  border-radius: 4px;
  cursor: pointer;
`;

export const Text = styled.div`
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  display: inline-block;
  white-space: pre;
`;
