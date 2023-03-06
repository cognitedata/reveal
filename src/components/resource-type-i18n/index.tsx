import { useTranslation } from 'common';
import { SourceType, TargetType } from 'context/QuickMatchContext';

type Props = {
  t: SourceType | TargetType;
  count?: number;
  downcase?: boolean;
};

export default function ResourceTypei18n({ t, count = 42, downcase }: Props) {
  const { t: translate } = useTranslation();
  switch (t) {
    case 'timeseries': {
      let s = translate('resource-timeseries');
      if (downcase) {
        s = s.toLowerCase();
      }
      return <>{s}</>;
    }
    case 'assets': {
      let s = translate('resource-asset', { count });
      if (downcase) {
        s = s.toLowerCase();
      }
      return <>{s}</>;
    }
    case 'events': {
      let s = translate('resource-type-events', { count });
      if (downcase) {
        s = s.toLowerCase();
      }
      return <>{s}</>;
    }
    default: {
      return null;
    }
  }
}
