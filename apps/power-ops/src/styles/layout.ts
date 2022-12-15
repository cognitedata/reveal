import styled from 'styled-components/macro';

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

export const BaseContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const VerticalFlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;
