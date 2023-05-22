import { ResourceDetailsHeader } from './ResourceDetailsHeader';
//
export default {
  title: 'Component/ResourceDetailsHeader',
  component: ResourceDetailsHeader,
};

export const Default = () => (
  <ResourceDetailsHeader
    title="Resource Details"
    onClose={() => console.log('Close button clicked')}
  />
);

export const WithIcon = () => (
  <ResourceDetailsHeader
    title="Resource Details"
    icon="Assets"
    onClose={() => console.log('Close button clicked')}
  />
);

export const WithCustomIcon = () => (
  <ResourceDetailsHeader
    title="Resource Details"
    icon={<button>Custom</button>}
    onClose={() => console.log('Close button clicked')}
  />
);

export const WithSelectButton = () => (
  <ResourceDetailsHeader
    title="Resource Details"
    showSelectButton
    isSelected={false}
    onSelectClicked={() => console.log('Select button clicked')}
    onClose={() => console.log('Close button clicked')}
  />
);

export const WithSelectButtonSelected = () => (
  <ResourceDetailsHeader
    title="Resource Details"
    showSelectButton
    isSelected
    onSelectClicked={() => console.log('Select button clicked')}
    onClose={() => console.log('Close button clicked')}
  />
);

export const WithAllProps = () => (
  <ResourceDetailsHeader
    title="Resource Details"
    icon="Assets"
    showSelectButton
    isSelected={false}
    onSelectClicked={() => console.log('Select button clicked')}
    onClose={() => console.log('Close button clicked')}
  />
);
