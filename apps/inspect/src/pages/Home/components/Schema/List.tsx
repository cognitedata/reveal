import { Loader } from '@cognite/cogs.js';
import { useLabelSchemas } from 'hooks/useLabelSchemas';

import { SchemaItem } from './Item';

export const SchemaList: React.FC<{
  onRun: (labelExternalId: string) => void;
}> = ({ onRun }) => {
  const { data, isLoading } = useLabelSchemas();

  if (isLoading) {
    return <Loader darkMode />;
  }

  return (
    <>
      {(data || []).map((item) => {
        return <SchemaItem key={item.id} {...item} onRun={onRun} />;
      })}
    </>
  );
};
