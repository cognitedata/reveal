import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import NewHeader from 'components/NewHeader';
import styled from 'styled-components';
import { getContainer } from 'utils/utils';
import {
  getExtractorsWithReleases,
  ExtractorWithRelease,
  Artifact,
  Release,
  getDownloadUrl,
} from './ExtractorDownloadApi';
import { Colors } from '@cognite/cogs.js';
import { ExpandableConfig } from 'antd/lib/table/interface';
import { useTranslation } from 'common/i18n';
import { getColumns, getArtifactName } from './common';

const GetExtractors = () => {
  const [extractors, setExtractors] = useState<ExtractorWithRelease[]>();
  useEffect(() => {
    getExtractorsWithReleases()
      .then((res) => {
        setExtractors(res);
      })
      // eslint-disable-next-line no-console
      .catch((e) => console.error(e));
  }, []);

  return extractors;
};

const Download = (artifact: Artifact) => {
  getDownloadUrl(artifact)
    .then((url) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = artifact.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    })
    // eslint-disable-next-line no-console
    .catch((e) => console.error(e));
};

const VersionTable = ({ releases }: { releases: Release[] }) => {
  const { t } = useTranslation();
  const { versionTableColumns } = getColumns(t);
  if (!releases) {
    return (
      <Table
        dataSource={undefined}
        columns={versionTableColumns}
        pagination={false}
        getPopupContainer={getContainer}
      />
    );
  }

  const dataSource: {
    key: number;
    version: string;
    description: string | undefined;
    releasedAt: string;
    artifacts: Artifact[];
    downloads: JSX.Element[];
  }[] = [];
  releases.forEach((release, idx) => {
    dataSource.push({
      key: idx,
      version: release.version,
      description: release.description,
      releasedAt: new Date(release.createdTime ?? 0).toLocaleDateString(
        'en-GB'
      ),
      artifacts: release.artifacts,
      downloads: release.artifacts.map((artifact) => (
        <LinkStyled onClick={() => Download(artifact)} key={artifact.name}>
          {getArtifactName(artifact)}
        </LinkStyled>
      )),
    });
  });

  return (
    <Table
      dataSource={dataSource}
      columns={versionTableColumns}
      pagination={false}
      getPopupContainer={getContainer}
    />
  );
};

const expandableConfig: ExpandableConfig<ExtractorWithRelease> = {
  defaultExpandAllRows: false,
  expandedRowRender: (record) => <VersionTable releases={record.releases} />,
};

const Extractors = () => {
  const { t } = useTranslation();
  const { extractorColumns } = getColumns(t);
  return (
    <StyledExtractorsContainer>
      <NewHeader
        title={t('extractor-downloads')}
        ornamentColor={Colors['lightblue']}
      />
      <Table
        dataSource={GetExtractors()}
        columns={extractorColumns}
        pagination={false}
        rowKey={(record) => record.externalId}
        expandable={expandableConfig}
        getPopupContainer={getContainer}
      />
    </StyledExtractorsContainer>
  );
};

const LinkStyled = styled.a`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: left;
  align-items: left;
`;

const StyledExtractorsContainer = styled.div`
  padding: 18px 44px;
`;

export default Extractors;
