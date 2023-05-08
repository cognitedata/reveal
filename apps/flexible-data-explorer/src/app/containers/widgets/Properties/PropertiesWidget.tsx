import { Widget, BaseWidgetProps } from '../../../components/widget/Widget';
import { PropertiesCollapsed } from './PropertiesCollapsed';
import { PropertiesExpanded } from './PropertiesExpanded';

// NOTE: Generalize the toggle between expanded and collapse, somehow.
export const PropertiesWidget = (props: BaseWidgetProps) => {
  return (
    <Widget id={props.id}>
      {props.isExpanded ? (
        <PropertiesExpanded {...props} />
      ) : (
        <PropertiesCollapsed {...props} />
      )}
    </Widget>
  );
};
