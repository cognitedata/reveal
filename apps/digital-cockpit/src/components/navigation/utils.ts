import { Metrics } from '@cognite/metrics';
import { MetricsHookMock } from 'utils/metrics';

export const handleHideSidebar = (
  isOpen: boolean,
  setOpen: (next: boolean) => void,
  metrics: Metrics | MetricsHookMock
) => {
  metrics.track(isOpen ? 'Hide' : 'Show');
  const next = !isOpen;
  setOpen(next);
};
