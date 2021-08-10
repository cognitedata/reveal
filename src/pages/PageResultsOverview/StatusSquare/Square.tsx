import styled from 'styled-components';

export const Square = styled.div.attrs(({ color }: { color: string }) => {
  const style: React.CSSProperties = {
    backgroundColor: color,
  };
  return { style };
})<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  margin-right: 8px;
`;
