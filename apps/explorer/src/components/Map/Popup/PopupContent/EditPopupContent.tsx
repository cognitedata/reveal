import { Button, Flex, Icon, IconType, Input, Label } from '@cognite/cogs.js';

interface Props {
  mainText: string;
  subText: string;
  iconType?: IconType;
  labels: string[];
  handleEdit: () => void;
  handleMainTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubTextChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// Note: Add ability to modify labels
export const EditPopupContent: React.FC<Props> = ({
  iconType = 'Cube',
  mainText,
  subText,
  labels,
  handleEdit,
  handleMainTextChange,
  handleSubTextChange,
}) => {
  return (
    <Flex
      direction="column"
      justifyContent="space-around"
      style={{ height: '100%' }}
    >
      <div>
        <Flex justifyContent="space-between" style={{ marginBottom: '5%' }}>
          <div style={{ width: '100%' }}>
            <Icon size={54} type={iconType} />
            <Flex direction="column">
              <div>
                Name: <Input value={mainText} onChange={handleMainTextChange} />
              </div>
              <div>
                Subtext:{' '}
                <Input value={subText} onChange={handleSubTextChange} />
              </div>
            </Flex>
          </div>
        </Flex>
      </div>

      <Flex gap={6}>
        {labels.map((label) => (
          <Label
            variant="unknown"
            key={label}
            icon="Close"
            iconPlacement="right"
          >
            {label}
          </Label>
        ))}
        <Label variant="unknown" icon="Add" />
      </Flex>
      <Flex justifyContent="flex-end">
        <Button onClick={handleEdit} type="primary">
          Done
        </Button>
      </Flex>
    </Flex>
  );
};
