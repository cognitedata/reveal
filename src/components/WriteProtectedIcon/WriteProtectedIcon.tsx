import lockIcon from 'assets/lockIcon.svg';
import { useTranslation } from 'common/i18n';
import InfoTooltip from '../InfoTooltip';

const WriteProtectedIcon = () => {
  const { t } = useTranslation();
  return (
    <InfoTooltip
      tooltipText={t('write-protected-tooltip')}
      url="https://docs.cognite.com/cdf/data_governance/concepts/datasets/#write-protection"
      urlTitle={t('learn-more-in-our-docs')}
      showIcon={false}
    >
      <img
        src={lockIcon}
        alt="write protected"
        style={{ height: '20px', width: '15px', display: 'inline' }}
      />{' '}
    </InfoTooltip>
  );
};

export default WriteProtectedIcon;
