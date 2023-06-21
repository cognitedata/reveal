import styled from 'styled-components';
import { Body, Icon } from '@cognite/cogs.js';
import React, { ReactText } from 'react';
import { CopyableText } from 'src/modules/FileDetails/Components/FileMetadata/CopyableText';
import {
  DataSetItem,
  LabelFilter,
  ByAssetFilter,
} from '@cognite/data-exploration';
import { Label } from '@cognite/sdk';
import useIsFieldSavePending from 'src/store/hooks/useIsFieldSavePending';
import { VisionFileDetailKey } from 'src/modules/FileDetails/Components/FileMetadata/Types';
import { Input } from 'antd';

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
        {props.loading && <Icon type="Loader" style={{ color: '#4a67fb' }} />}
      </FlexContainer>
    );
  }
  return null;
};

export const FileDetailFieldView = (props: {
  id: VisionFileDetailKey;
  title: string;
  // eslint-disable-next-line react/no-unused-prop-types
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
    <DropDownContainer>
      <FieldContainer>
        <LabelFilter
          resourceType="file"
          value={props.value}
          setValue={handleSetValue}
        />
      </FieldContainer>
      <Loader loading={loading} />
    </DropDownContainer>
  );
};

export const AssetContainerView = (props: {
  value: number[] | undefined;
  setValue: (assets?: number[]) => void;
}) => {
  const loading = useIsFieldSavePending('assetIds');

  const handleSetValue = (val?: number[]) => {
    props.setValue(val);
  };
  return (
    <DropDownContainer>
      <FieldContainer>
        <ByAssetFilter value={props.value} setValue={handleSetValue} />
      </FieldContainer>
      <Loader loading={loading} />
    </DropDownContainer>
  );
};

export const DataSetFieldView = (props: { fileId: number }) => {
  return (
    <DataSetFieldContainer>
      <DataSetItem id={props.fileId} type="file" />
    </DataSetFieldContainer>
  );
};

const DropDownContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 14px;

  & div.loader-container {
    margin-top: 20px;
  }
`;

const FieldContainer = styled.div`
  width: 100%;

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
