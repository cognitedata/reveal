import React, { FunctionComponent } from 'react';
import { CopyType } from 'components/InteractiveCopyWithText';
import { StyledLink } from 'styles/StyledLinks';
import InteractiveCopy from 'components/InteractiveCopy';

interface OwnProps {
  href: string;
  linkText: string;
  copyType: CopyType;
  copyText: string;
}

type Props = OwnProps;

const LinkWithCopy: FunctionComponent<Props> = ({
  href,
  linkText,
  copyType,
  copyText,
  ...rest
}: OwnProps) => {
  return (
    <>
      <StyledLink
        href={href}
        target="_blank"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        {...rest}
      >
        {linkText}
      </StyledLink>
      <InteractiveCopy text={copyText} copyType={copyType} />
    </>
  );
};

export default LinkWithCopy;
