import styled, { css } from 'styled-components/macro';

// first level flex stuff:

export const Flex = styled.div`
  display: flex;
`;

export const InlineFlex = styled.div`
  display: inline-flex;
`;
export const FlexGrow = styled.div`
  flex-grow: 1;
`;

// second level flex stuff:

export const Center = styled(Flex as any)`
  justify-content: center;
`;

export const FlexAlignJustifyContent = styled(Flex as any)`
  justify-content: center;
  align-items: center;
`;

export const FlexAlignItems = styled(Flex as any)`
  align-items: center;
`;

export const FlexAlignEnd = styled(Flex as any)`
  align-items: flex-end;
`;

export const FlexColumn = styled(Flex as any)`
  flex-direction: column;
  width: 100%;
`;

export const FlexRow = styled(Flex as any)`
  flex-direction: row;
`;

export const FlexShrinkWrap = styled(Flex as any)`
  flex-wrap: wrap;
  flex-shrink: 0;
`;

export const Ellipsis = css`
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const FlexNoWrapRow = styled(Flex as any)`
  flex-direction: row;
  flex-wrap: no-wrap;
`;

export const FullWidth = styled.div`
  width: 100%;
`;

/**
 * MARGINS AND PADDINGS
 */
const extraSmall = '4px';
const small = '8px';
const normal = '16px';
const medium = '24px';
const large = '40px';
const extraLarge = '48px';
const huge = '80px';

export const sizes = {
  /** 4px */
  extraSmall,
  /** 8px */
  small,
  /** 16px */
  normal,
  /** 24px */
  medium,
  /** 40px */
  large,
  /** 48px */
  extraLarge,
  /** 80px */
  huge,
};

/**
 * Containers
 */
export const Relative = styled.div`
  position: relative;
`;
export const Absolute = styled.div`
  position: absolute;
`;
export const DisplayRelative = styled.div`
  display: relative;
`;
export const MarginRightSmallContainer = styled.div`
  margin-right: ${sizes.small};
`;
export const MarginRightContainer = styled.div`
  margin-right: ${sizes.normal};
`;
export const MarginRightLargeContainer = styled.div`
  margin-right: ${sizes.large};
`;
export const MarginSmallContainer = styled.div`
  margin: ${sizes.small};
`;
export const MarginBottomSmallContainer = styled.div`
  margin-bottom: ${sizes.small};
`;
export const MarginBottomNormalContainer = styled.div`
  margin-bottom: ${sizes.normal};
`;
export const PaddingMediumContainer = styled.div`
  padding: ${sizes.medium};
`;
export const PaddingTopMediumContainer = styled.div`
  padding-top: ${sizes.medium};
`;
export const RightAligned = styled.div`
  margin-left: auto;
  margin-right: ${sizes.normal};
  margin-top: ${sizes.normal};
`;
export const RightAlignedSmall = styled.div`
  margin-left: auto;
  margin-right: ${sizes.normal};
  margin-top: ${sizes.small};
`;
export const PositionTopRight = styled(Absolute)`
  top: 5px;
  right: 5px;
`;

/**
 * Media Queries
 *
 * Because we're designing desktop first, we're
 * using max-width in stead of min-width.
 * 
 * USAGE EXAMPLE: 
 
 @media ${device.NORMAL} {
   ...
 }

 */

const devices = {
  SMALL: '1024px',
  NORMAL: '1920px',
  LARGE: '2560px',
};

export const device = {
  SMALL: `(max-width: ${devices.SMALL})`,
  NORMAL: `(max-width: ${devices.NORMAL})`,
  LARGE: `(max-width: ${devices.LARGE})`,
};

/**
 * Media Queries
 *
 * Used around scrollable pages. Provides a padding around the content of the
 * page which uses HUGE on big displays, and LARGE on smaller ones.
 */
export const PagePaddingWrapper = styled.div`
  padding-top: ${sizes.large};
  padding-right: ${sizes.huge};
  padding-left: ${sizes.huge};

  @media ${device.NORMAL} {
    padding-right: ${sizes.large};
    padding-left: ${sizes.large};
  }
`;

export const PageBottomPaddingWrapper = styled(PagePaddingWrapper)`
  flex: 1;
  display: flex;
  align-items: stretch;
  padding-bottom: ${sizes.large};
`;

export const NewLine = styled.div`
  margin-bottom: 8px;
`;
