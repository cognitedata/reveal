import React, { FunctionComponent } from 'react';

import InteractiveCopy, { CopyType } from '../InteractiveCopy/InteractiveCopy';
import { StyledLink } from '../styled';

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
      <InteractiveCopy
        showTextInTooltip={linkText !== copyText}
        text={copyText}
        copyType={copyType}
      />
    </>
  );
};

export default LinkWithCopy;
