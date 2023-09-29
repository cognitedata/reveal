import { useTranslation } from '../../common';
import { SourceType, TargetType } from '../../types/api';

type Props = {
  t: SourceType | TargetType;
  count?: number;
  downcase?: boolean;
};

export default function ResourceTypei18n({ t, count = 0, downcase }: Props) {
  const { t: translate } = useTranslation();
  switch (t) {
    case 'timeseries': {
      return (
        <>
          {translate('resource-timeseries', {
            postProcess: downcase ? 'lowercase' : undefined,
            count,
          })}
        </>
      );
    }
    case 'assets': {
      return (
        <>
          {translate('resource-asset', {
            postProcess: downcase ? 'lowercase' : undefined,
            count,
          })}
        </>
      );
    }
    case 'events': {
      return (
        <>
          {translate('resource-type-events', {
            postProcess: downcase ? 'lowercase' : undefined,
            count,
          })}
        </>
      );
    }

    case 'files': {
      return (
        <>
          {translate('resource-type-files', {
            postProcess: downcase ? 'lowercase' : undefined,
            count,
          })}
        </>
      );
    }
    case 'sequences': {
      return (
        <>
          {translate('resource-type-sequences', {
            postProcess: downcase ? 'lowercase' : undefined,
            count,
          })}
        </>
      );
    }
    default: {
      return null;
    }
  }
}
