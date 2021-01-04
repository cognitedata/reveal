import React from 'react';
import haveNewMessagesIcon from 'assets/have-new-messages-icon.svg';
import styled from 'styled-components';
import { Status } from '../../model/Status';

interface OwnProps {
  status: Status;
}

type Props = OwnProps;

const StyledMessageIcon = styled.img.attrs({
  src: `${haveNewMessagesIcon}`,
})`
  margin-left: 0.625rem;
`;

const MessageIcon = ({ status }: Props) => {
  switch (status) {
    case Status.FAIL:
      return <StyledMessageIcon />;
    default:
      return <></>;
  }
};

export default MessageIcon;
