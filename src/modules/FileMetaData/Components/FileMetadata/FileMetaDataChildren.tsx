import styled from 'styled-components';
import { Body, Icon, Input } from '@cognite/cogs.js';
import React, { ReactText } from 'react';
import { CopyableText } from 'src/modules/FileMetaData/Components/FileMetadata/CopyableText';
import { DataSetItem, LabelFilter } from '@cognite/data-exploration';
import { Label } from '@cognite/cdf-sdk-singleton';
import useIsFieldSavePending from 'src/store/hooks/useIsFieldSavePending';
import { VisionFileDetailKey } from 'src/modules/FileMetaData/Components/FileMetadata/Types';

const FieldViewContainer = styled.div`
  margin-bottom: 14px;
`;

const FieldViewTitle = styled(Body)`
  margin-bottom: 4px;
`;
const FieldViewTextContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;
const FieldViewText = styled.span`
  margin-left: 12px;
`;
const FieldViewInputContainer = styled.div`
  width: 100%;
  max-width: 450px;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 20px;
`;

const NOT_SET_PLACEHOLDER = 'None Set';

const Loader = (props: { loading: boolean }) => {
  if (props.loading) {
    return (
      <FlexContainer className="loader-container">
        {props.loading && <Icon type="Loading" style={{ color: '#4a67fb' }} />}
      </FlexContainer>
    );
  }
  return null;
};

export const FileDetailFieldView = (props: {
  id: VisionFileDetailKey;
  title: string;
  placeholder?: string;
  value?: ReactText;
  copyable?: boolean;
  editable?: boolean;
  onBlur?: (key: VisionFileDetailKey, value: ReactText) => void;
  onInput?: (key: VisionFileDetailKey, value: ReactText) => void;
}) => {
  const loading = useIsFieldSavePending(props.id);

  const onInput = (evt: any) => {
    if (props.onInput) {
      props.onInput(props.id, evt.target.value);
    }
  };

  const onBlur = () => {
    if (props.onBlur) {
      props.onBlur(props.id, props.value || '');
    }
  };

  const fieldValue = props.value || NOT_SET_PLACEHOLDER;
  return (
    <FieldViewContainer>
      <FieldViewTitle level={2} strong>
        {props.title}
      </FieldViewTitle>
      <FieldViewTextContainer>
        <CopyableText copyable={props.copyable} text={props.value}>
          {props.editable ? (
            <FieldViewInputContainer>
              <Input
                size="default"
                fullWidth
                placeholder={props?.placeholder || NOT_SET_PLACEHOLDER}
                value={props.value || ''}
                onInput={onInput}
                style={{ paddingInline: 12 }}
                onBlur={onBlur}
              />
            </FieldViewInputContainer>
          ) : (
            <FieldViewText>{fieldValue}</FieldViewText>
          )}
        </CopyableText>
        {props.editable && <Loader loading={loading} />}
      </FieldViewTextContainer>
    </FieldViewContainer>
  );
};

export const LabelContainerView = (props: {
  value: Label[] | undefined;
  setValue: (labels?: Label[]) => void;
}) => {
  const loading = useIsFieldSavePending('labels');

  const handleSetValue = (val?: Label[]) => {
    props.setValue(val);
  };
  return (
    <LabelFieldContainer>
      <LabelContainer>
        <LabelFilter
          resourceType="file"
          value={props.value}
          setValue={handleSetValue}
        />
      </LabelContainer>
      <Loader loading={loading} />
    </LabelFieldContainer>
  );
};

export const DataSetFieldView = (props: { fileId: number }) => {
  return (
    <DataSetFieldContainer>
      <DataSetItem id={props.fileId} type="file" />
    </DataSetFieldContainer>
  );
};

const LabelFieldContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 14px;

  & div.loader-container {
    margin-top: 20px;
  }
`;

const LabelContainer = styled.div`
  width: 450px;

  & div.title:first-child {
    color: var(--cogs-b2-color);
    font-size: var(--cogs-b2-font-size);
    font-weight: 500;
    line-height: var(--cogs-b2-line-height);
    letter-spacing: var(--cogs-b2-letter-spacing);
    margin-top: 0 !important;
    margin-bottom: 4px !important;
  }
`;

const DataSetFieldContainer = styled.div`
  margin-bottom: 14px;

  & div > div {
    color: var(--cogs-b2-color);
    font-size: var(--cogs-b2-font-size);
    font-weight: 500;
    line-height: var(--cogs-b2-line-height);
    letter-spacing: var(--cogs-b2-letter-spacing);
    margin-top: 0 !important;
    margin-bottom: 4px !important;
  }

  & a {
    font-size: 14px;
    margin-left: 12px;
  }
`;
