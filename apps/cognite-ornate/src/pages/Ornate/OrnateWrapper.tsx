import React from 'react';
import { AuthConsumer, AuthContext } from '@cognite/react-container';

import Ornate from './Ornate';

export const OrnateWrapper: React.FC = () => (
  <AuthConsumer>
    {({ client }: AuthContext) => (client ? <Ornate client={client} /> : null)}
  </AuthConsumer>
);
