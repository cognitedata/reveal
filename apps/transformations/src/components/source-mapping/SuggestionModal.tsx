import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@transformations/common';
import FormFieldSelect from '@transformations/components/form-field-select';
import SchemaItem from '@transformations/components/target/SchemaItem';
import { useSchema, useUpdateTransformation } from '@transformations/hooks';
import { TransformationRead } from '@transformations/types';

import { Checkbox, Flex, Icon, Modal } from '@cognite/cogs.js';

import { useSuggestions } from './hooks';
import { parseTransformationMapping, getUpdateMapping } from './utils';

type Props = {
  closeModal: () => void;
  transformation: TransformationRead;
};

export default function SourceSelectionDropdownSuggestionModal({
  closeModal,
  transformation,
}: Props) {
  const { t } = useTranslation();
  const [selectAll, setSelectAll] = useState(false);

  const [enabledSuggestion, setEnabledSuggestion] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<
    Record<string, string>
  >({});

  const { mutateAsync, isLoading } = useUpdateTransformation();
  const { data: suggestions } = useSuggestions(transformation);

  const { data: destinationSchemas } = useSchema({
    destination: transformation.destination,
    action: transformation.conflictMode,
  });

  const onSubmit = async (enabledSuggestion: string[]) => {
    const mapping = parseTransformationMapping(transformation.query);
    mapping.mappings = mapping.mappings.map((m) => ({
      ...m,
      from:
        selectAll || enabledSuggestion.includes(m.to)
          ? selectedSuggestion[m.to] || m.from
          : m.from,
      asType:
        selectAll || enabledSuggestion.includes(m.to)
          ? destinationSchemas?.find((s) => s.name === m.to)?.sqlType ||
            m.asType
          : m.asType,
    }));

    await mutateAsync(getUpdateMapping(transformation, mapping));
    closeModal();
  };

  useEffect(() => {
    if (
      suggestions &&
      enabledSuggestion.length === 0 &&
      suggestions?.length > 0
    ) {
      setEnabledSuggestion(suggestions.map((s) => s.from));
    }
  }, [suggestions, enabledSuggestion.length]);

  useEffect(() => {
    if (suggestions) {
      const newSelectedSuggestions: Record<string, string> = suggestions.reduce(
        (accl, d) => ({ ...accl, [d.from]: d.to[0]?.label }),
        {}
      );
      setSelectedSuggestion(newSelectedSuggestions);
    }
  }, [suggestions]);

  return (
    <Modal
      title={t('source-view-suggestions-modal-title', {
        count: suggestions?.length || 0,
      })}
      okText={t('source-view-suggestions-modal-ok')}
      onOk={() => onSubmit(enabledSuggestion)}
      okDisabled={isLoading}
      cancelText={t('cancel')}
      onCancel={closeModal}
      visible={true}
      icon={isLoading ? 'Loader' : 'LightBulb'}
    >
      <ModalContent>
        <p>{t('source-view-suggestions-modal-description')}</p>
        <Checkbox
          checked={selectAll}
          onChange={() => setSelectAll(!selectAll)}
          name="select-all"
        >
          {t('source-view-suggestions-select-all')}
        </Checkbox>
        <Flex direction="column" gap={12}>
          {suggestions?.map(({ from, to }) => {
            const destination = destinationSchemas?.find(
              (s) => s.name === from
            );
            if (!destination) {
              return null;
            }
            return (
              <Flex
                key={from}
                justifyContent="space-between"
                alignItems="center"
                gap={10}
              >
                <Checkbox
                  checked={enabledSuggestion.includes(from) || selectAll}
                  disabled={selectAll}
                  name={from}
                  onChange={(checked) => {
                    if (checked && !enabledSuggestion.includes(from)) {
                      setEnabledSuggestion([...enabledSuggestion, from]);
                    } else {
                      setEnabledSuggestion(
                        enabledSuggestion.filter((v) => v != from)
                      );
                    }
                  }}
                />
                <Flex style={{ width: '40%' }}>
                  <div style={{ width: '100%' }}>
                    <FormFieldSelect<string>
                      onChange={(e) =>
                        setSelectedSuggestion({
                          ...selectedSuggestion,
                          [from]: e,
                        })
                      }
                      value={selectedSuggestion[from]}
                      options={to.map((s) => ({
                        label: (
                          <Flex justifyContent="space-between">
                            <span>{s.label}</span>
                            {s.type ? <span>{s.type}</span> : undefined}
                          </Flex>
                        ),
                        value: s.label,
                      }))}
                    />
                  </div>
                </Flex>
                <Flex style={{ flexGrow: 1 }} justifyContent="space-around">
                  <Icon type="ArrowRight" />
                </Flex>
                <div style={{ width: '40%' }}>
                  <SchemaItem
                    schema={destination}
                    transformation={transformation}
                  />
                </div>
              </Flex>
            );
          })}
        </Flex>
      </ModalContent>
    </Modal>
  );
}

const ModalContent = styled.div`
  max-height: 832px;
  overflow: auto;
`;
