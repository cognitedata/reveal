import lockIcon from 'assets/lockIcon.svg';
import InfoTooltip from '../InfoTooltip';

const WriteProtectedIcon = () => (
  <InfoTooltip
    tooltipText="Only members of groups that you explicitly grant access, can write data
      to a write-protected data set."
    url="https://docs.cognite.com/cdf/data_governance/concepts/datasets/#write-protection"
    urlTitle="Learn more in our docs."
    showIcon={false}
  >
    <img
      src={lockIcon}
      alt="write protected"
      style={{ height: '20px', width: '15px', display: 'inline' }}
    />{' '}
  </InfoTooltip>
);

export default WriteProtectedIcon;
