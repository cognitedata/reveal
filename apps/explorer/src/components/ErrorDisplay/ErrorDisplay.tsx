import { AvatarButton } from 'components/AvatarButton';
import { RegularHeader } from 'components/Header';
import { NavigateToSearchButton } from 'components/SearchBar';
import { PAGES } from 'pages/routers/constants';
import React from 'react';
import { Link } from 'react-router-dom';

import { ErrorBody, ErrorHeader, MarginWrapper } from './elements';

const renderLeftHeader = () => <NavigateToSearchButton />;

export const ErrorDisplay: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  return (
    <>
      <MarginWrapper>
        <RegularHeader Left={renderLeftHeader}>
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
