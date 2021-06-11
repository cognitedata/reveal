import { Helmet } from 'react-helmet';
import { useTranslation } from '@cognite/react-i18n';

const TitleChanger = ({
  applicationName,
  applicationId,
}: {
  applicationName: string;
  applicationId: string;
}) => {
  const { t } = useTranslation('Title');
  return (
    <Helmet>
      <title>
        {t(`app-name_${applicationId}_title`, {
          defaultValue: applicationName || applicationId,
        })}
      </title>
    </Helmet>
  );
};

export default TitleChanger;
