import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import NewHeader from 'components/NewHeader';
import styled from 'styled-components';
import { getContainer } from 'utils/utils';
import {
  getDownloadUrl,
  listExtractors,
  listReleases,
} from './ExtractorDownloadApi';
import { Colors } from '@cognite/cogs.js';

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

const versionTableColumns = [
  {
    title: 'Version',
    dataIndex: 'version',
    key: 'version',
    width: 110,
  },
  {
    title: 'Release date',
    dataIndex: 'releasedAt',
    key: 'releasedAt',
    width: 140,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Download links',
    dataIndex: 'downloads',
    key: 'downloads',
    width: 280,
  },
];

const GetUrl = (extractorTag: string, version: string, platform: string) => {
  const platformParameter =
    platform === 'Documentation' ? 'docs' : platform.toLowerCase();
  const [fileUrl, setFileUrl] = useState<string>();
  useEffect(() => {
    getDownloadUrl(extractorTag, version, platformParameter)
      .then((res) => {
        setFileUrl(res.data.download);
      })
      // eslint-disable-next-line no-console
      .catch((e) => console.error(e));
  }, [extractorTag, version, platformParameter]);

  return fileUrl;
};

const GetExtractors = () => {
  const [extractors, setExtractors] = useState<any>();
  useEffect(() => {
    listExtractors()
      .then((res) => {
        setExtractors(res.data.items);
      })
      // eslint-disable-next-line no-console
      .catch((e) => console.error(e));
  }, []);

  return extractors;
};

const GetReleases = () => {
  const [extractors, setExtractors] = useState<any>();
  useEffect(() => {
    listReleases()
      .then((res) => {
        setExtractors(res.data.items);
      })
      // eslint-disable-next-line no-console
      .catch((e) => console.error(e));
  }, []);

  return extractors;
};

const VersionTable = ({
  extractorTag,
  releases,
}: {
  extractorTag: string;
  releases: any;
}) => {
  if (!releases[extractorTag]) {
    return (
      <Table
        dataSource={undefined}
        columns={versionTableColumns}
        pagination={false}
        getPopupContainer={getContainer}
      />
    );
  }

  const dataSource = releases[extractorTag].map((releaseElem, idx) => {
    const { version, description, releaseDate: releasedAt } = releaseElem;
    const downloads = releaseElem.artifacts.map((artifact: string) => (
      <LinkStyled
        href={GetUrl(extractorTag, version, artifact.split(' ')[0])}
        key={artifact}
      >
        {artifact}
      </LinkStyled>
    ));

    return {
      key: idx,
      version,
      description,
      releasedAt,
      downloads,
    };
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

const extractorColumns = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    width: 250,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
];

const Extractors = () => {
  const releases = GetReleases();

  return (
    <StyledExtractorsContainer>
      <NewHeader
        title="Extractor downloads"
        ornamentColor={Colors['lightblue']}
      />
      <Table
        dataSource={GetExtractors()}
        columns={extractorColumns}
        pagination={false}
        rowKey="tag"
        expandedRowRender={(record) => (
          <VersionTable extractorTag={record.tag} releases={releases} />
        )}
        getPopupContainer={getContainer}
      />
    </StyledExtractorsContainer>
  );
};

export default Extractors;
