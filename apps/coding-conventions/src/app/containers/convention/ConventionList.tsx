import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse';
import { Convention } from '../../types';

import { ConventionItem } from './ConventionItem';
import { Content } from './elements';

interface Props {
  conventions: Convention[];
  editMode?: boolean;
  activeKeys: string[];
  onKeysChange: (keys: string[]) => void;
  onConventionChange: (updatedConvention: Convention) => void;
  onConventionDeleteClick?: (deletedConvention: Convention) => void;
}
export const ConventionList: React.FC<Props> = ({
  conventions,
  activeKeys,
  onKeysChange,
  onConventionChange,
  editMode,
}) => {
  return (
    <Content>
      <BaseFilterCollapse
        editMode={editMode}
        activeKeys={editMode ? [] : activeKeys}
        onChange={(keys) => {
          onKeysChange(keys);
        }}
        onIconClick={() => {
          console.log('HEY');
        }}
      >
        {conventions
          .sort((a, b) => a.start - b.start)
          .map((convention) => (
            <BaseFilterCollapse.Panel
              key={convention.id}
              editMode={editMode}
              conventions={conventions}
              convention={convention}
              onChange={(updatedConvention) => {
                onConventionChange(updatedConvention);
              }}
            >
              {!editMode && (
                <ConventionItem
                  conventions={conventions}
                  selectedConvention={convention}
                />
              )}
            </BaseFilterCollapse.Panel>
          ))}
      </BaseFilterCollapse>
    </Content>
  );
};
