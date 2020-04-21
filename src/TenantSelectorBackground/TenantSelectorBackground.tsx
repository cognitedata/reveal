import React from 'react';
import LogoWithText from 'icons/LogoWithText';
import {
  Background,
  CogniteLogo,
  StyledIconWrapper,
  CLetter,
  NLetter,
} from './elements';
import { useIsDesktop } from '../useIsDesktop';

interface Props {
  children: React.ReactNode;
  className?: string;
  backgroundImage: string;
}

const TenantSelectorBackground = (props: Props) => {
  const isDesktop = useIsDesktop();
  return (
    <Background
      className={props.className}
      backgroundImage={props.backgroundImage}
    >
      <CogniteLogo>
        <StyledIconWrapper>
          <LogoWithText />
        </StyledIconWrapper>
      </CogniteLogo>
      {isDesktop ? (
        <>
          <CLetter />
          <NLetter />
        </>
      ) : null}
      {props.children}
    </Background>
  );
};

export default TenantSelectorBackground;
