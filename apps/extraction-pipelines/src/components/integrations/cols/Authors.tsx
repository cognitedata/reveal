import React, { FunctionComponent } from 'react';
import { Avatar, Tooltip } from '@cognite/cogs.js';
import { User } from '../../../model/User';
import AvatarGroup from '../../Avatar/AvatarGroup';

interface OwnProps {
  authors: User[];
}

type Props = OwnProps;

const Authors: FunctionComponent<Props> = ({ authors }: Props) => {
  return (
    <AvatarGroup>
      {authors.map((author) => {
        const display = author.name ? author.name : author.email;
        return (
          <Tooltip
            placement="bottom"
            content={author.email}
            key={`tooltip-${display}`}
          >
            <>
              <Avatar
                text={display}
                key={`avatar-${author.email}`}
                aria-label={`Avatar for ${author.name}`}
              />
            </>
          </Tooltip>
        );
      })}
    </AvatarGroup>
  );
};

export default Authors;
