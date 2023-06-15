import { useTranslation } from '@transformations/common';
import QueryPreviewWarnings, {
  getMostUrgentWarningType,
  groupWarnings,
  isMultipleWarningType,
} from '@transformations/components/query-preview-warnings';
import Tab from '@transformations/components/tab';
import { QueryPreviewSuccess, Warning } from '@transformations/hooks';
import QueryResultsTable from '@transformations/pages/transformation-details/QueryResultsTable';
import { useTransformationContext } from '@transformations/pages/transformation-details/TransformationContext';
import { getIconPropsFromWarningType } from '@transformations/utils';
import { useDurationFormat } from '@transformations/utils/time';

type ValidQueryPreviewProps = {
  className?: string;
  data: QueryPreviewSuccess;
  tabKey: string;
  warnings?: Warning[];
};

const ValidQueryPreview = ({
  className,
  data,
  tabKey,
  warnings,
}: ValidQueryPreviewProps): JSX.Element => {
  const { t } = useTranslation();

  const { removeTab } = useTransformationContext();

  const duration = useDurationFormat(data.duration);

  if (warnings?.length) {
    const groupedWarnings = groupWarnings(warnings);
    const isMultiple = isMultipleWarningType(groupedWarnings);
    const mostUrgentWarningType =
      getMostUrgentWarningType(warnings) ?? 'unknown-column';
    const iconProps = getIconPropsFromWarningType(mostUrgentWarningType);

    return (
      <Tab
        className={className}
        headerProps={{
          description: t('valid-query-description', {
            count: data?.data?.results.items.length,
            duration,
          }),
          details: (
            <QueryPreviewWarnings
              groupedWarnings={groupedWarnings}
              isMultiple={isMultiple}
            />
          ),
          icon: iconProps.icon,
          title: isMultiple
            ? t('query-preview-tab-multiple-warning-title', {
                count: warnings.length,
              })
            : t(`query-preview-tab-${mostUrgentWarningType}-warning-title`, {
                count: groupedWarnings[mostUrgentWarningType].length,
              }),
        }}
        onClose={() => removeTab(tabKey)}
        sql={data?.query}
        status={iconProps.status}
      >
        {data && <QueryResultsTable data={data} warnings={warnings} />}
      </Tab>
    );
  }

  return (
    <Tab
      headerProps={{
        description: t('valid-query-description', {
          count: data?.data?.results.items.length,
          duration,
        }),
        icon: 'CheckmarkFilled',
        title: t('success'),
      }}
      onClose={() => removeTab(tabKey)}
      sql={data?.query}
      status="success"
    >
      <QueryResultsTable data={data} warnings={warnings} />
    </Tab>
  );
};

export default ValidQueryPreview;
