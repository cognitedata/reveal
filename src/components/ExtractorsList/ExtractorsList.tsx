import {
  Body,
  Button,
  Colors,
  Elevations,
  Flex,
  Title,
} from '@cognite/cogs.js';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

import { useTranslation } from 'common';
import { useExtractorsList } from 'hooks/useExtractorsList';

// TODO: remove this if the backend returns the images
import osiImgUrl from 'assets/osi-soft.png';
import odbcImgUrl from 'assets/odbc.png';
import opcuaImgUrl from 'assets/opc-ua.png';
import documentumImgUrl from 'assets/documentum.png';
import piafImgUrl from 'assets/piaf.png';
import prosperImgUrl from 'assets/prosper.png';

// TODO: remove this if the backend returns the images
const images = {
  'cognite-db': odbcImgUrl,
  'cognite-doc': documentumImgUrl,
  'cognite-opcua': opcuaImgUrl,
  'cognite-pi': osiImgUrl,
  'cognite-piaf': piafImgUrl,
  'cognite-simconnect': prosperImgUrl,
};

const ExtractorsList = () => {
  const { t } = useTranslation();
  const { data: extractors } = useExtractorsList();
  const history = useHistory();
  return (
    <Flex gap={24} direction="column">
      <Flex gap={4} direction="column">
        <Title level="4">{t('cognite-extractors')}</Title>
        <Body level="1">{t('install-prebuilt-cognite-extractors')}</Body>
      </Flex>
      <StyledGrid>
        {extractors?.map((extractor) => (
          <StyledExtractorContainer
            onClick={() => {
              history.push(createLink(`/extractors/${extractor.externalId}`));
            }}
          >
            <Flex gap={24} direction="column">
              <div>
                <img src={images[extractor.externalId]} />
              </div>
              <Flex gap={8} direction="column">
                <Title level="5">{extractor.name}</Title>
                <StyledMutedDescription>
                  {extractor.description}
                </StyledMutedDescription>
              </Flex>
            </Flex>
          </StyledExtractorContainer>
        ))}
      </StyledGrid>
    </Flex>
  );
};

export default ExtractorsList;

const StyledGrid = styled.div`
  display: grid;
  justify-content: space-between;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(256px, 1fr));
`;

const StyledExtractorContainer = styled(Button).attrs({ type: 'ghost' })`
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  text-align: left;
  border: 1px solid ${Colors['border--interactive--default']};
  border-radius: 6px;
  cursor: pointer;
  transition: box-shadow 500ms ease;
  min-height: 212px;

  &:hover {
    background-color: white;
    box-shadow: ${Elevations['elevation--surface--interactive--hover']};
    transition: box-shadow 500ms ease;
  }

  && {
    padding: 24px;
    height: auto;
  }
`;

const StyledMutedDescription = styled(Body).attrs({ level: 3 })`
  color: ${Colors['text-icon--muted']};
`;
