import { AvatarButton } from 'components/AvatarButton';
import { RegularHeader } from 'components/Header';
import { SearchBarAndList } from 'components/SearchBarAndList';
import { PAGES } from 'pages/constants';
import React from 'react';
import { Link } from 'react-router-dom';

import { ErrorBody, ErrorHeader, MarginWrapper } from './elements';

export const ErrorDisplay: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <>
      <MarginWrapper>
        <RegularHeader>
          <RegularHeader.Left>
            <SearchBarAndList placeholder="What are you looking for?" />
          </RegularHeader.Left>
          <Link to={PAGES.PROFILE}>
            <AvatarButton />
          </Link>
        </RegularHeader>
      </MarginWrapper>
      <ErrorHeader>An Error has occurred</ErrorHeader>
      <ErrorBody>{children}</ErrorBody>
    </>
  );
};
