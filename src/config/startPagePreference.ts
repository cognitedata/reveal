const LAYOUT_KEY = 'chartsStartPageLayout';

export const currentStartPageLayout = () =>
  (localStorage.getItem(LAYOUT_KEY) as 'grid' | 'list' | null) ?? 'list';

export const changeStartPageLayout = (viewOption: 'grid' | 'list') => {
  localStorage.setItem(LAYOUT_KEY, viewOption);
};
