import styled from 'styled-components';

import { Flex } from '@cognite/cogs.js';

import graphics from '../../common/assets/graphics';

export const Container = styled(Flex)`
  width: 80%;
  max-width: 1088px;
  padding: 150px;
  margin: 100px auto;
  box-sizing: border-box;
  border: 2px dashed rgba(0, 0, 0, 0.15);
  border-radius: 16px;

  *:not(:last-child) {
    margin-bottom: 16px;
  }
`;

export const Graphic = styled.img.attrs({ src: graphics.TemplateGraphic })`
  margin-left: 40px;
`;
