import { Flex, SegmentedControl, Title, Input, Button } from '@cognite/cogs.js';

export interface AppsListHeaderProps {
  appsCount: number;
  onSearchChange: (newSearchText: string) => void;
  onCreateAppClick: () => void;
  onFilterAppTypeChange: (appType: 'published' | 'all' | 'yours') => void;
  searchText: string;
}

export const AppsListHeader = (props: AppsListHeaderProps) => {
  //   const filesWriteAcl = useCapabilities('dataModelsAcl', ['WRITE'], {
  //     checkAll: false,
  //   });
  const isOnMobile = window.innerWidth < 768;

  return (
    <Flex justifyContent="space-between" className="header" gap={6}>
      <Title level={3} data-cy="data-models-title">
        Apps
        {`(${props.appsCount})`}
      </Title>
      <Flex style={{ display: 'inline-flex' }} gap={16}>
        <SegmentedControl currentKey="yours">
          <SegmentedControl.Button
            onClick={() => props.onFilterAppTypeChange('all')}
            key="all"
          >
            All
          </SegmentedControl.Button>
          <SegmentedControl.Button
            onClick={() => props.onFilterAppTypeChange('published')}
            key="published"
          >
            Published
          </SegmentedControl.Button>
          <SegmentedControl.Button
            onClick={() => props.onFilterAppTypeChange('yours')}
            key="yours"
          >
            Yours
          </SegmentedControl.Button>
        </SegmentedControl>
        <Input
          iconPlacement="right"
          icon="Search"
          placeholder="Search"
          type="search"
          data-cy="search-data-models"
          value={props.searchText}
          style={{ marginRight: '8px' }}
          onChange={(e) => {
            props.onSearchChange(e.currentTarget.value);
          }}
        />
        {!isOnMobile && (
          <Button
            type="primary"
            data-cy="create-app-btn"
            onClick={props.onCreateAppClick}
          >
            Create app
          </Button>
        )}
      </Flex>
    </Flex>
  );
};
