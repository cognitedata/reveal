import React, { FunctionComponent } from 'react';
import { StyledLink } from '../../styles/StyledButtons';
import InteractiveCopy from '../InteractiveCopy';

interface OwnProps {
  href: string;
  linkText: string;
  copyText: string;
}

type Props = OwnProps;

const LinkWithCopy: FunctionComponent<Props> = ({
  href,
  linkText,
  copyText,
  ...rest
}: OwnProps) => {
  return (
    <>
      <StyledLink href={href} target="_blank" {...rest}>
        {linkText}
      </StyledLink>
      <InteractiveCopy text={copyText} />
    </>
  );
};

export default LinkWithCopy;
