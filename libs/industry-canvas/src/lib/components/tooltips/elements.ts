import styled from 'styled-components';

// The bottom attribute doesn't take the `marginBottom` into account, hence this will be `bottom - marginBottom` pixels over the top of the main tooltip
export const LeftAlignedColorPalettePosition = styled.div`
  position: absolute;
  bottom: 18px;
  transform: translate(0%, -100%);
`;

export const RightAlignedColorPalettePosition = styled.div`
  position: absolute;
  bottom: 18px;
  left: 100%;
  transform: translate(-100%, -100%);
`;
