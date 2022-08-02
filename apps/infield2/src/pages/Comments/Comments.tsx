import * as React from 'react';
import { Body, Title } from '@cognite/cogs.js';
import { Link } from 'react-router-dom';

import { PAGES } from '../Menubar';
import { Container } from '../elements';

import { Content } from './elements';

export const CommentsPage: React.FC = () => {
  return (
    <Container>
      <Title>We have two examples of how to use comments:</Title>

      <Body>
        <Content>
          <ul>
            <li>
              <Link to={PAGES.COMMENTS_SLIDER}>Slider</Link>
            </li>
            <li>
              <Link to={PAGES.COMMENTS_DRAWER}>Drawer</Link>
            </li>
          </ul>
        </Content>
      </Body>
    </Container>
  );
};

export default CommentsPage;
