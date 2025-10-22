import { Body, BodySize, Heading, TypographyProps } from '@cognite/cogs.js';
import styled, { FastOmit } from 'styled-components';
import { Mouse } from './Graphics/Mouse';
import { SVGProps, DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES, RefObject, ReactElement, Component } from 'react';
import { IStyledComponentBase } from 'styled-components/dist/types';
import { DetailedHTMLProps, HTMLAttributes } from 'react';
import { IStyledComponentBase } from 'styled-components/dist/types';
import { BaseHTMLAttributes, RefAttributes, DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES, RefObject, ForwardRefExoticComponent, Component } from 'react';
import { IStyledComponentBase, Substitute } from 'styled-components/dist/types';

export const SectionContainer: IStyledComponentBase<"web", FastOmit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, never>> & string = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: fit-content;
  max-width: fit-content;
`;

export const SectionTitle: IStyledComponentBase<"web", FastOmit<FastOmit<Substitute<Omit<Omit<BaseHTMLAttributes<HTMLHeadingElement>, "inverted" | "muted" | "as" | "level"> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    as?: string;
    muted?: boolean;
    inverted?: boolean;
} & TypographyProps & RefAttributes<HTMLHeadingElement>, "ref"> & {
    ref?: ((instance: HTMLHeadingElement | null) => void | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | RefObject<HTMLHeadingElement> | null | undefined;
}, Omit<Omit<BaseHTMLAttributes<HTMLHeadingElement>, "inverted" | "muted" | "as" | "level"> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    as?: string;
    muted?: boolean;
    inverted?: boolean;
} & TypographyProps & RefAttributes<HTMLHeadingElement>, "ref"> & {
    ref?: ((instance: HTMLHeadingElement | null) => void | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | RefObject<HTMLHeadingElement> | null | undefined;
}>, never>, never>> & string & Omit<ForwardRefExoticComponent<Omit<BaseHTMLAttributes<HTMLHeadingElement>, "inverted" | "muted" | "as" | "level"> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    as?: string;
    muted?: boolean;
    inverted?: boolean;
} & TypographyProps & RefAttributes<HTMLHeadingElement>>, keyof Component<any, {}, any>> = styled(Heading).attrs({ level: 3 })`
  color: #ffffff;
`;

export const SectionSubTitle: IStyledComponentBase<"web", FastOmit<FastOmit<Substitute<Omit<Omit<BaseHTMLAttributes<HTMLHeadingElement>, "inverted" | "muted" | "as" | "level"> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    as?: string;
    muted?: boolean;
    inverted?: boolean;
} & TypographyProps & RefAttributes<HTMLHeadingElement>, "ref"> & {
    ref?: ((instance: HTMLHeadingElement | null) => void | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | RefObject<HTMLHeadingElement> | null | undefined;
}, Omit<Omit<BaseHTMLAttributes<HTMLHeadingElement>, "inverted" | "muted" | "as" | "level"> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    as?: string;
    muted?: boolean;
    inverted?: boolean;
} & TypographyProps & RefAttributes<HTMLHeadingElement>, "ref"> & {
    ref?: ((instance: HTMLHeadingElement | null) => void | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | RefObject<HTMLHeadingElement> | null | undefined;
}>, never>, never>> & string & Omit<ForwardRefExoticComponent<Omit<BaseHTMLAttributes<HTMLHeadingElement>, "inverted" | "muted" | "as" | "level"> & {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    as?: string;
    muted?: boolean;
    inverted?: boolean;
} & TypographyProps & RefAttributes<HTMLHeadingElement>>, keyof Component<any, {}, any>> = styled(Heading).attrs({ level: 5 })`
  color: #ffffff;
`;

export const SectionContent: IStyledComponentBase<"web", FastOmit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, never>> & string = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  height: 100%;
`;

export const InstructionText: IStyledComponentBase<"web", FastOmit<FastOmit<Substitute<Omit<Omit<BaseHTMLAttributes<HTMLSpanElement>, "inverted" | "muted" | "as" | "strong" | "size" | "noOfLines"> & {
    size?: BodySize;
    noOfLines?: number;
    as?: string;
    strong?: boolean;
    muted?: boolean;
    inverted?: boolean;
} & TypographyProps & RefAttributes<HTMLSpanElement>, "ref"> & {
    ref?: ((instance: HTMLSpanElement | null) => void | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | RefObject<HTMLSpanElement> | null | undefined;
}, Omit<Omit<BaseHTMLAttributes<HTMLSpanElement>, "inverted" | "muted" | "as" | "strong" | "size" | "noOfLines"> & {
    size?: BodySize;
    noOfLines?: number;
    as?: string;
    strong?: boolean;
    muted?: boolean;
    inverted?: boolean;
} & TypographyProps & RefAttributes<HTMLSpanElement>, "ref"> & {
    ref?: ((instance: HTMLSpanElement | null) => void | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | RefObject<HTMLSpanElement> | null | undefined;
}>, never>, never>> & string & Omit<ForwardRefExoticComponent<Omit<BaseHTMLAttributes<HTMLSpanElement>, "inverted" | "muted" | "as" | "strong" | "size" | "noOfLines"> & {
    size?: BodySize;
    noOfLines?: number;
    as?: string;
    strong?: boolean;
    muted?: boolean;
    inverted?: boolean;
} & TypographyProps & RefAttributes<HTMLSpanElement>>, keyof Component<any, {}, any>> = styled(Body).attrs({
  level: 3,
  strong: true
})`
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
`;

export const InstructionDetail: IStyledComponentBase<"web", FastOmit<FastOmit<Substitute<Omit<Omit<BaseHTMLAttributes<HTMLSpanElement>, "inverted" | "muted" | "as" | "strong" | "size" | "noOfLines"> & {
    size?: BodySize;
    noOfLines?: number;
    as?: string;
    strong?: boolean;
    muted?: boolean;
    inverted?: boolean;
} & TypographyProps & RefAttributes<HTMLSpanElement>, "ref"> & {
    ref?: ((instance: HTMLSpanElement | null) => void | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | RefObject<HTMLSpanElement> | null | undefined;
}, Omit<Omit<BaseHTMLAttributes<HTMLSpanElement>, "inverted" | "muted" | "as" | "strong" | "size" | "noOfLines"> & {
    size?: BodySize;
    noOfLines?: number;
    as?: string;
    strong?: boolean;
    muted?: boolean;
    inverted?: boolean;
} & TypographyProps & RefAttributes<HTMLSpanElement>, "ref"> & {
    ref?: ((instance: HTMLSpanElement | null) => void | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | RefObject<HTMLSpanElement> | null | undefined;
}>, never>, never>> & string & Omit<ForwardRefExoticComponent<Omit<BaseHTMLAttributes<HTMLSpanElement>, "inverted" | "muted" | "as" | "strong" | "size" | "noOfLines"> & {
    size?: BodySize;
    noOfLines?: number;
    as?: string;
    strong?: boolean;
    muted?: boolean;
    inverted?: boolean;
} & TypographyProps & RefAttributes<HTMLSpanElement>>, keyof Component<any, {}, any>> = styled(Body).attrs({
  size: 'small'
})`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.006em;
  white-space: pre-line;
`;

export const MouseNavigationInstructionGrid: IStyledComponentBase<"web", FastOmit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, never>> & string = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  gap: 8px;
  width: fit-content;
  justify-items: center;
  align-items: center;
  padding-top: 12px;

  ${InstructionText}:first-of-type {
    padding-left: 10px;
    grid-column: 1/-1;
    text-align: right;
  }

  ${InstructionText}:last-of-type {
    text-align: left;
  }
`;

export const MouseNavigationCombinedGridItem: IStyledComponentBase<"web", FastOmit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, never>> & string = styled.div`
  grid-column: 2 / 3;
  grid-row: 2 / 3;
`;

export const KeyboardNavigationInstructionGrid: IStyledComponentBase<"web", FastOmit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, never>> & string = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  width: fit-content;
  justify-items: center;
  align-items: center;
  text-align: center;
`;

export const ArrowKeyboardNavigationInstructionGrid: IStyledComponentBase<"web", FastOmit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, never>> & string = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  padding-left: 12px;
  width: fit-content;
  justify-items: center;
  align-items: center;

  ${InstructionText}:first-of-type {
    padding-left: 10px;
    grid-column: 1/-1;
    text-align: right;
  }

  ${InstructionText}:last-of-type {
    text-align: center;
  }
`;

export const TouchNavigationInstructionGrid: IStyledComponentBase<"web", FastOmit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, never>> & string = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr;
  width: fit-content;
  justify-items: center;
  padding-top: 12px;

  ${InstructionText}:first-of-type {
    padding-left: 10px;
    grid-column: 1/-1;
    text-align: right;
  }

  ${InstructionText}:last-of-type {
    text-align: center;
  }
`;

export const TouchNavigationCombinedGridItem: IStyledComponentBase<"web", FastOmit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, never>> & string = styled.div`
  grid-column: 2 / 3;
  grid-row: 1 / 3;
  padding-top: 40px;
`;

export const StyledMouse: IStyledComponentBase<"web", FastOmit<Omit<SVGProps<SVGSVGElement>, "ref"> & {
    ref?: ((instance: SVGSVGElement | null) => void | DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES[keyof DO_NOT_USE_OR_YOU_WILL_BE_FIRED_CALLBACK_REF_RETURN_VALUES]) | RefObject<SVGSVGElement> | null | undefined;
}, never>> & string & Omit<(props: SVGProps<SVGSVGElement>) => ReactElement, keyof Component<any, {}, any>> = styled(Mouse)`
  display: flex;
  justify-content: center;

  ::before {
    content: '';
    position: absolute;
    display: inline-block;
    margin-top: 12px;
    width: 110px;
    border-top: 1px solid white;
  }
`;
