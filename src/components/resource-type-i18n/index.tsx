import { useTranslation } from 'common';
import { SourceType, TargetType } from 'context/QuickMatchContext';

type Props = {
  t: SourceType | TargetType;
  count?: number;
};

export default function ResourceTypei18n({ t, count = 42 }: Props) {
  const { t: translate } = useTranslation();
  switch (t) {
    case 'timeseries': {
      return <>{translate('resource-timeseries')}</>;
    }
    case 'assets': {
      return <>{translate('resource-asset', { count })}</>;
    }
    default: {
      return null;
    }
  }
}
