interface ColorRange {
  main: string;
  text: string;
  dark?: string;
  opacity80: string;
  opacity60: string;
  opacity40: string;
  opacity20: string;
  opacity10: string;
  opacity5: string;
}

export interface Spacing {
  (): number;
  (value: number): number;
}

export interface Theme {
  spacing: Spacing;
  palette: {
    primary: ColorRange;
    secondary: ColorRange;
    tertiery: ColorRange;
    quaternary: ColorRange;
    black: ColorRange;
    error: ColorRange;
    background: string;
    divider: string;
    white: string;
    gray: string;
    lightgrey: string;
    blue: string;
    tooltip: {
      color: string;
      background: string;
    };
    background1: string; // Refactor to something like background: {primary, secondary etc..}
    background2: string; // Refactor to something like background: {primary, secondary etc..}
    background3: string; // Refactor to something like background: {primary, secondary etc..}
    spacing: (factor: number) => number;
  };
  shadows: any[];

  button: {
    color: string;
    borderColor: string;
    text: {
      color: string;
    };
    hover: {
      borderColor: string;
      color: string;
    };
  };
  card: {
    backgroundColor: string;
  };
}
