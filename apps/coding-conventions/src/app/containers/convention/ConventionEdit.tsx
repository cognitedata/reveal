import { Flex } from '@cognite/cogs.js';
import { toast } from '@cognite/cogs.js';

import { Modal } from '../../components/Modal/Modal';

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useConventionUpdateMutate } from '../../service/hooks/mutate/useConventionUpdateMutate';
import { useConventionListQuery } from '../../service/hooks/query/useConventionListQuery';
import { TagDefinitions, TagRange, TagRegex } from '../../types';
import { generateId } from '../../utils/generators';
import { EditRange } from '../definitions/EditRange';
import { EditRegex } from '../definitions/EditRegex';

const emptyDefinition = {
  id: '',
  description: '',
  type: '',
  regex: '',
  value: [0, 0],
  minimumCharacterLength: 0,
};

export const ConventionEdit = () => {
  const navigate = useNavigate();

  const {
    systemId,
    conventionId,
    definitionsId,
    dependsOnId,
    type: definitionType,
  } = useParams();

  const { data: conventions } = useConventionListQuery();
  const { mutate: updateConventions } = useConventionUpdateMutate();

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (errors.length === 0) return;
    toast.error(
      <div>
        {errors.map((err) => (
          <p key={err}> {err}</p>
        ))}
      </div>,
      {
        position: 'bottom-left',
      }
    );
  }, [errors]);

  const selectedConvention = conventions?.find(
    (item) => item.id === conventionId
  );
  const [definition, setDefinition] = useState<TagDefinitions | undefined>(
    selectedConvention?.definitions?.find(
      (defItem) => defItem.id === definitionsId
    )
  );

  if (!selectedConvention) return null;
  const type = definitionType;

  if (definition === undefined && definitionsId === 'new') {
    const newDef = {
      ...emptyDefinition,
      id: generateId(),
      type: definitionType,
      dependsOn: dependsOnId,
    };

    setDefinition(newDef as TagRegex | TagRange);
  }

  const onChangeRegex = (regex: string, description: string) => {
    setDefinition({
      ...definition,
      regex: regex || '',
      description: description || '',
    } as TagRegex);
  };

  const onChangeRange = (
    minValue: number,
    maxValue: number,
    description: string,
    minimumCharacterLength?: number
  ) => {
    setDefinition({
      ...definition,
      value: [minValue, maxValue],
      description,
      minimumCharacterLength: minimumCharacterLength || 0,
    } as TagRange);
  };

  const isValidRange = (range: TagRange) => {
    const newErrors = [];
    if (range.value[0] > range.value[1]) {
      newErrors.push('minValue is greater than maxValue');
    }

    if (range.description.length === 0) {
      newErrors.push('Description is required');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const isValidRegex = (regex: TagRegex) => {
    const newErrors = [];
    try {
      new RegExp(regex.regex);
    } catch (e) {
      newErrors.push('Invalid regex');
    }

    if (regex.description.length === 0) {
      newErrors.push('Description is required');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const saveOnCreateDefinition = () => {
    if (!definition) return;

    if (definition.type === 'Range') {
      if (!isValidRange(definition as TagRange)) return;
    } else if (definition.type === 'Regex') {
      if (!isValidRegex(definition as TagRegex)) return;
    }

    if (definitionsId === 'new') {
      selectedConvention.definitions = [
        ...(selectedConvention.definitions || []),
        definition as TagRegex | TagRange,
      ];
    } else {
      selectedConvention.definitions = selectedConvention.definitions?.map(
        (def) => {
          if (def.id === definition.id) {
            return definition;
          }
          return def;
        }
      );
    }

    updateConventions([selectedConvention]);
    navigate(`/conventions/${systemId}`);
  };

  return (
    <Flex gap={8} direction="column">
      {type === 'Regex' && (
        <Modal
          title="Edit data"
          visible={!!true}
          modalWidth="600px"
          modalMaxHeight="700px"
          onCancel={() => navigate(`/conventions/${systemId}`)}
          onOk={saveOnCreateDefinition}
        >
          <EditRegex
            regex={(definition as TagRegex)?.regex || ''}
            description={definition?.description || ''}
            onChange={onChangeRegex}
          />
        </Modal>
      )}
      {type === 'Range' && (
        <Modal
          title="Edit data"
          visible={!!true}
          modalWidth="600px"
          modalMaxHeight="700px"
          onCancel={() => navigate(`/conventions/${systemId}`)}
          onOk={saveOnCreateDefinition}
        >
          <EditRange
            minValue={(definition as TagRange)?.value[0] || 0}
            maxValue={(definition as TagRange)?.value[1] || 0}
            description={definition?.description || ''}
            minimumCharacterLength={
              (definition as TagRange)?.minimumCharacterLength || 0
            }
            onChange={onChangeRange}
          />
        </Modal>
      )}
    </Flex>
  );
};
