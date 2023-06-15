import { useTranslation } from '@transformations/common/i18n';
import { Section } from '@transformations/components/profiling-section';
import Distribution from '@transformations/containers/raw-preview-content/profiling/Distribution';
import { Count } from '@transformations/hooks/profiling-service';

import { Flex } from '@cognite/cogs.js';

type Props = {
  histogram?: Count[];
  max?: number;
  title?: string;
  isHalf?: boolean;
  isCompact?: boolean;
};
export const SectionDistribution = ({
  histogram,
  max,
  title,
  isHalf,
  isCompact,
}: Props): JSX.Element => {
  const height = isCompact ? 200 : 330;
  const { t } = useTranslation();

  return (
    <Section
      title={title ?? t('distribution')}
      isCompact={isCompact}
      isHalf={isHalf}
    >
      {histogram ? (
        <Flex
          direction="column"
          justifyContent="flex-end"
          style={{
            height,
            width: '100%',
          }}
        >
          <div style={{ height }}>
            <Distribution
              distribution={histogram}
              isBottomAxisDisplayed
              isGridDisplayed
              isTooltipDisplayed
              rangeEnd={max}
            />
          </div>
        </Flex>
      ) : (
        t('missing-summary')
      )}
    </Section>
  );
};
