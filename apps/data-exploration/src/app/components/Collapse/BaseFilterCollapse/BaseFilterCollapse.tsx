import {
  BaseFilterPanel as BaseFilterPanelComponent,
  BaseFilterCollapse as BaseFilterCollapseComponent,
  BaseFilterPanelProps as BaseFilterPanelPropsComponent,
} from '@data-exploration/components';

// Will remove this file completely in a separate PR
export const BaseFilterCollapse = BaseFilterCollapseComponent;
export const BaseFilterPanel = BaseFilterPanelComponent;
export type BaseFilterPanelProps = BaseFilterPanelPropsComponent;

BaseFilterCollapse.Panel = BaseFilterPanel;
