import { useTranslation } from '@transformations/common';
import { StyledErrorMessage } from '@transformations/common/assets/styled-components';
import Tab from '@transformations/components/tab';
import { QueryPreviewSuccess } from '@transformations/hooks';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { useDurationFormat } from '@transformations/utils/time';
import { Alert } from 'antd';

import { Flex } from '@cognite/cogs.js';

type InvalidQueryPreviewProps = {
  className?: string;
  data: QueryPreviewSuccess;
  tabKey: string;
};

const InvalidQueryPreview = ({
  className,
  data,
  tabKey,
}: InvalidQueryPreviewProps) => {
  const { t } = useTranslation();

  const { removeTab } = useTransformationContext();

  const duration = useDurationFormat(data?.duration);

  if (!data.invalidQuery) {
    return null;
  }

  return (
    <Tab
      className={className}
      headerProps={{
        description: duration,
        icon: 'WarningFilled',
        title: t('error'),
      }}
      onClose={() => removeTab(tabKey)}
      sql={data?.query}
      status="critical"
    >
      <Alert
        type="error"
        description={
          <Flex direction="column" gap={8}>
            <StyledErrorMessage level={3}>
              {data?.errorFeedback}
            </StyledErrorMessage>
          </Flex>
        }
      />
    </Tab>
  );
};

export default InvalidQueryPreview;
