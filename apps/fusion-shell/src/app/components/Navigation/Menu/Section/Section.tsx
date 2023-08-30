import { ReactElement } from 'react';

import styled from 'styled-components';

import { TranslationKeys, useTranslation } from '../../../../../i18n';
import theme from '../../../../styles/theme';
import { Section as SectionType, SectionColors } from '../../../../types';
import Link from '../../../Link';

interface SectionProps {
  section: SectionType;
  showSectionName?: boolean;
  onClose?: (destination: string) => void;
  children: ReactElement | ReactElement[];
  isCompact?: boolean;
}

interface ContainerProps {
  background: string;
  showSectionName?: boolean;
  isCompact?: boolean;
}

const Container = styled.div.attrs((props: ContainerProps) => {
  if (props.isCompact) {
    return {
      style: {
        display: 'flex',
        flexDirection: 'row',
      },
    };
  }
  return {};
})<ContainerProps>`
  position: relative;
  flex-grow: 1;
  background-color: ${(props) => props.background};
  padding: ${(props) => (props.showSectionName ? '36px' : '0')};

  * > {
    flex: ${({ isCompact }) => (isCompact ? '1 1 50%' : 'auto')};
  }
`;

const SectionName = styled.div`
  text-transform: uppercase;
  font-weight: bold;
  font-size: 20px;
  position: relative;
  color: ${theme.textColor};
  margin: 36px 0;
  margin-top: 0;
  &::after {
    content: '';
    position: absolute;
    bottom: -20px;
    left: 0;
    background-color: ${(props) => props.color};
    width: 48px;
    height: 4px;
    transition: width 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
  }
`;

export const SectionNameLink = styled(SectionName)`
  &:hover::after {
    width: 72px;
  }
`;

interface SectionContentProps {
  colors: SectionColors;
  isCompact?: boolean;
}

const SectionContent = styled.div.attrs((props: SectionContentProps) => {
  if (props.isCompact) {
    return {
      style: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
    };
  }
  return {};
})<SectionContentProps>`
  width: 100%;
  .icon {
    background-color: ${(props) => props.colors.secondary};
    color: ${(props) => props.colors.icon || theme.textColor};
  }
`;

const Section = (props: SectionProps) => {
  const {
    section,
    showSectionName = true,
    onClose,
    children,
    isCompact = false,
  } = props;
  const { t } = useTranslation();
  const { colors, linkTo, externalLinkTo, sameWindow = false } = section;
  const title = t(`app-${section.internalId}-title` as TranslationKeys);

  let sectionName;
  const linkToUrl = linkTo;

  if (linkTo) {
    sectionName = (
      <Link to={linkToUrl!} onClick={() => onClose && onClose(title)}>
        <SectionNameLink color={colors.primary}>{title}</SectionNameLink>
      </Link>
    );
  } else if (externalLinkTo) {
    sectionName = (
      <a
        href={externalLinkTo}
        target={sameWindow ? '_self' : '_blank'}
        rel="noopener noreferrer"
        onClick={() => onClose && onClose(title)}
      >
        <SectionNameLink color={colors.primary}>{title}</SectionNameLink>
      </a>
    );
  } else {
    sectionName = <SectionName color={colors.primary}>{title}</SectionName>;
  }

  return (
    <Container
      background={colors.background || 'transparent'}
      showSectionName={showSectionName}
      isCompact={isCompact}
    >
      {showSectionName && sectionName}
      <SectionContent colors={colors} isCompact={isCompact}>
        {children}
      </SectionContent>
    </Container>
  );
};

export default Section;
