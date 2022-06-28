import { Infobox } from '@cognite/cogs.js';
import DetailsBlock from 'components/DetailsBlock/DetailsBlock';
import ValueList from 'components/ValueList/ValueList';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';

const defaultTranslations = makeDefaultTranslations(
  'Name',
  'Description',
  'External ID',
  'Updated',
  'Step',
  'Yes',
  'No',
  'ID',
  'Equipment Tag',
  'Data set',
  'Not set',
  'There was a problem loading the metadata'
);

type Props = {
  loading: boolean;
  error: string | boolean;
  type: string; // 'timeseries' | 'calculation';
  sourceId: string | undefined;
  name: string | undefined;
  lastUpdatedTime: string | undefined;
  description?: string;
  externalId?: string;
  isStep?: boolean;
  equipmentTag?: string;
  equipmentLink?: string;
  datasetName?: string;
  datasetLink?: string;
  translations?: typeof defaultTranslations;
};

const MetadataPanel = ({
  loading,
  error,
  type,
  name,
  description,
  externalId,
  lastUpdatedTime,
  isStep,
  sourceId,
  equipmentTag,
  equipmentLink,
  datasetName,
  datasetLink,
  translations,
}: Props) => {
  const t = { ...defaultTranslations, ...translations };

  const list =
    type === 'timeseries'
      ? [
          { label: t.Name, value: name, copyable: true },
          { label: t.Description, value: description, copyable: true },
          { label: t['External ID'], value: externalId, copyable: true },
          { label: t['Data set'], value: datasetName, link: datasetLink },
          { label: t.Updated, value: lastUpdatedTime },
          { label: t.Step, value: isStep ? t.Yes : t.No },
          { label: t.ID, value: sourceId, copyable: true },
          {
            label: t['Equipment Tag'],
            value: equipmentTag,
            link: equipmentLink,
          },
        ]
      : [
          { label: t.Name, value: name, copyable: true },
          { label: t.ID, value: sourceId, copyable: true },
          { label: t.Updated, value: lastUpdatedTime },
        ];

  return (
    <>
      {!loading && error && (
        <Infobox
          type="warning"
          title={t['There was a problem loading the metadata']}
        >
          {error}
        </Infobox>
      )}
      <DetailsBlock>
        <ValueList loading={loading} list={list} emptyLabel={t['Not set']} />
      </DetailsBlock>
    </>
  );
};

MetadataPanel.defaultTranslations = defaultTranslations;
MetadataPanel.translationKeys = translationKeys(defaultTranslations);
MetadataPanel.translationNamespace = 'MetadataPanel';

export default MetadataPanel;
