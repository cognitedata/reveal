import { TooltipWrapper } from './elements';
import { TooltipOffset } from './utils';

type Props = {
  content: JSX.Element;
  offset: TooltipOffset;
  visible: boolean;
  alignClass?: 'left-from-point' | 'right-from-point';
};

export const CommonChartTooltip = ({
  content,
  offset,
  visible,
  alignClass = 'right-from-point',
}: Props) => {
  return visible ? (
    <TooltipWrapper
      className={alignClass}
      style={{
        top: `${offset.top}px`,
        left: `${offset.left}px`,
      }}
    >
      {content}
    </TooltipWrapper>
  ) : null;
};
