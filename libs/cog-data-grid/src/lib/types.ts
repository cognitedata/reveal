export type ThemeNames =
  | 'default'
  | 'compact'
  | 'suggestions'
  | 'basic-striped';
export type ThemeClasses = {
  [key in ThemeNames]: string;
};
