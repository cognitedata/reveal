import React, { FunctionComponent } from 'react';
import { Avatar } from 'antd';
import { Colors } from '@cognite/cogs.js';
import { User } from '../../../model/User';

interface OwnProps {
  authors: User[];
}

type Props = OwnProps;

const Authors: FunctionComponent<Props> = ({ authors }: Props) => {
  return (
    <Avatar.Group
      maxCount={1}
      maxStyle={{ color: '#fff', backgroundColor: Colors.primary.hex() }}
    >
      {authors &&
        authors.map((author) => {
          return (
            <Avatar
              key={`avatar-${author.email}`}
              alt={`avatar for ${author.name}`}
            >
              {author.name.substr(0, 1)}
            </Avatar>
          );
        })}
    </Avatar.Group>
  );
};

export default Authors;
