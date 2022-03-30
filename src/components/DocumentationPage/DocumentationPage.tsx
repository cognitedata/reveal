import { useState, useEffect } from 'react';
import Col from 'antd/lib/col';
import { Button } from '@cognite/cogs.js';
import Radio from 'antd/lib/radio';
import { FileInfo, DataSet, Documentation } from 'utils/types';
import Drawer from 'components/Drawer';
import {
  IconWrapper,
  InputField,
  UnApprovedDot,
  ApprovedDot,
  FieldLabel,
} from 'utils/styledComponents';
import { trackEvent } from '@cognite/cdf-route-tracker';
import documentationIcon from 'assets/documentationIcon.svg';
import { isNotNilOrWhitespace } from 'utils/shared';
import UploadFiles from '../UploadFiles';
import LinksList from '../LinksList';
import InfoTooltip from '../InfoTooltip';

interface DocumentationProps {
  dataSet?: DataSet;
  updateDataSet(dataSet: DataSet): void;
  closeModal(): void;
  changesSaved: boolean;
  setChangesSaved(value: boolean): void;
  visible: boolean;
  saveSection: boolean;
}

const DocumentationPage = (props: DocumentationProps): JSX.Element => {
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const [urlList, setUrlList] = useState<{ name: string; id: string }[]>([]);
  const [ownerName, setOwnerName] = useState<string>('');
  const [ownerEmail, setOwnerEmail] = useState<string>('');
  const [qualityAssessment, setQuality] = useState<boolean>();

  useEffect(() => {
    if (props.saveSection) {
      handleSaveChanges();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.saveSection]);

  // set values for fields
  useEffect(() => {
    if (props.dataSet) {
      // owner
      if (Array.isArray(props.dataSet.metadata.consoleOwners)) {
        setOwnerEmail(props.dataSet.metadata.consoleOwners[0]?.email);
        setOwnerName(props.dataSet.metadata.consoleOwners[0]?.name);
      }

      // docs
      if (props.dataSet.metadata.consoleAdditionalDocs) {
        if (Array.isArray(props.dataSet.metadata.consoleAdditionalDocs)) {
          // files
          setFileList(
            props.dataSet.metadata.consoleAdditionalDocs
              .filter((value) => value.type === 'file')
              .map((value) => {
                return { id: Number(value.id), name: value.name };
              })
          );
          // links
          setUrlList(
            props.dataSet.metadata.consoleAdditionalDocs
              .filter(
                (value) =>
                  value.type === 'url' && isNotNilOrWhitespace(value.id)
              )
              .map((value) => {
                return { name: value.name, id: value.id };
              })
          );
        }
        // quality assessment
        if (props.dataSet.metadata.consoleGoverned !== undefined) {
          setQuality(props.dataSet.metadata.consoleGoverned);
        }
      }
    }
  }, [props.dataSet]);

  const handleSaveChanges = () => {
    if (props.dataSet) {
      const newDataSet: DataSet = props.dataSet;
      // check & set owner
      if (ownerName || ownerEmail) {
        trackEvent('DataSets.MetadataUsage.Used owner fields name', {
          name: ownerName,
          email: ownerEmail,
        });
        newDataSet.metadata.consoleOwners = [
          {
            name: ownerName,
            email: ownerEmail,
          },
        ];
      }
      // check & set file ids & links
      if (fileList || urlList) {
        const documentation: Documentation[] = [];
        fileList.forEach((file) => {
          documentation.push({
            type: 'file',
            id: String(file.id),
            name: file.name,
          });
        });
        urlList.forEach((value) => {
          trackEvent('DataSets.MetadataUsage.Used links');
          documentation.push({ type: 'url', id: value.id, name: value.name });
        });
        newDataSet.metadata.consoleAdditionalDocs = documentation;
      }
      if (qualityAssessment !== undefined) {
        trackEvent('DataSets.MetadataUsage.Used quality assessment', {
          governed: qualityAssessment,
        });
        newDataSet.metadata.consoleGoverned = qualityAssessment;
      }

      props.updateDataSet(newDataSet);
      props.setChangesSaved(true);
      props.closeModal();
    }
  };

  const addLink = () => {
    const newList = urlList || [];
    setUrlList([...newList, { name: '', id: '' }]);
    props.setChangesSaved(false);
  };
  const updateLink = (
    updatedLink: { name: string; id: string },
    index: number
  ) => {
    const tempList = [...urlList];
    tempList[index] = updatedLink;
    setUrlList(tempList);
    props.setChangesSaved(false);
  };

  const removeLink = (index: number) => {
    const tempList = [...urlList];
    tempList.splice(index, 1);
    setUrlList(tempList);
    props.setChangesSaved(false);
  };

  return (
    <Drawer
      title={<div>Add documentation</div>}
      width="50%"
      onClose={() => props.closeModal()}
      visible={props.visible}
      okText={props.changesSaved ? 'Done' : 'Save'}
      onOk={props.changesSaved ? props.closeModal : handleSaveChanges}
      cancelHidden
    >
      <div>
        <Col span={24}>
          <Col span={18}>
            <FieldLabel>
              <InfoTooltip
                title="Owner name"
                showIcon
                tooltipText="The owner is responsible for the quality of the data in the data set and can answer questions about the data set."
                placement="left"
              />
            </FieldLabel>
            <InputField
              style={{ width: '400px' }}
              value={ownerName}
              type="text"
              placeholder="owner"
              onChange={(e) => {
                setOwnerName(e.currentTarget.value);
                props.setChangesSaved(false);
              }}
            />
            <FieldLabel>Owner email</FieldLabel>
            <InputField
              style={{ width: '400px' }}
              value={ownerEmail}
              type="email"
              placeholder="email"
              onChange={(e) => {
                setOwnerEmail(e.currentTarget.value);
                props.setChangesSaved(false);
              }}
            />
          </Col>
          <Col span={6}>
            <IconWrapper>
              <img src={documentationIcon} alt="Add data " />
            </IconWrapper>
          </Col>
        </Col>
        <Col style={{ marginTop: '20px' }} span={24}>
          <FieldLabel>Upload documents</FieldLabel>
          <UploadFiles
            fileList={fileList}
            setFileList={setFileList}
            setChangesSaved={props.setChangesSaved}
          />
          <FieldLabel>Add links</FieldLabel>
          {urlList.map((url, index) => (
            <LinksList
              value={url}
              remove={removeLink}
              update={updateLink}
              index={index}
              add={addLink}
            />
          ))}
          <Button type="primary" onClick={() => addLink()}>
            {' '}
            Add new link
          </Button>

          <FieldLabel>Governance status</FieldLabel>
          <p>
            Governed data sets have a designated owner and follows the
            governance processes for data in your organization.{' '}
            <a
              href="https://docs.cognite.com/cdf/data_governance/concepts/datasets/#governance-status"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more in our docs.
            </a>
          </p>
          <Radio.Group
            style={{ width: '100%' }}
            value={qualityAssessment}
            buttonStyle="solid"
            onChange={(e) => {
              setQuality(e.target.value);
              props.setChangesSaved(false);
            }}
          >
            <Radio.Button value style={{ width: '50%', textAlign: 'center' }}>
              <ApprovedDot />
              Governed
            </Radio.Button>
            <Radio.Button
              value={false}
              style={{ width: '50%', textAlign: 'center' }}
            >
              <UnApprovedDot />
              Ungoverned
            </Radio.Button>
          </Radio.Group>
        </Col>
      </div>
    </Drawer>
  );
};

export default DocumentationPage;
