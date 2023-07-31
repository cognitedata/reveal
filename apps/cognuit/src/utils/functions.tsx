import { useLocation } from 'react-router-dom-v5';

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}
