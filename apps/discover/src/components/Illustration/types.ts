export type IllustrationType = 'Favorites' | 'Search' | 'Recent';

export interface Props {
  type: IllustrationType;
  alt?: string;
}
