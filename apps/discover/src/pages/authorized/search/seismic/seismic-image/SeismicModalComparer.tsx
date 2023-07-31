import React, { useEffect, useState } from 'react';
import { Scrollbars } from 'react-custom-scrollbars';

import styled from 'styled-components/macro';

import { Checkbox, Loader, Button, Tabs } from '@cognite/cogs.js';

import { BlankModal } from 'components/Modal';
// import { showInfoMessage } from 'components/Toast';
import { Select } from 'components/Select/Select';
import { Typography } from 'components/Typography';
import { useTranslation } from 'hooks/useTranslation';
import { useSeismic, useSelectedFiles } from 'modules/seismicSearch/selectors';
import { SeismicCollection, Slices } from 'modules/seismicSearch/types';
import { Flex, FlexGrow } from 'styles/layout';

import { SeismicDisplayContent, SeismicHeaderWrapper } from './elements';
import { ImageComparer } from './ImageComparer';
import { SeismicPreview } from './SeismicPreview';

const TabsWrapper = styled(FlexGrow)`
  overflow-x: auto;
  margin-bottom: 8px;
`;

// interface OptionType {
//   ident: string;
//   isDisabled: boolean;
//   title: string;
//   logo: any;
// }

// const options: OptionType[] = [
//   {
//     ident: 'petrel',
//     isDisabled: true,
//     title: 'Open in Petrel',
//     logo: petrelLogo,
//   },
//   { ident: 'swa', isDisabled: false, title: 'Open in SWA', logo: swaLogo },
// ];

const Actions = ({
  handleClose,
}: // handleOpenWith,
{
  handleClose: () => void;
  // handleOpenWith?: (option: OptionType) => void;
}) => {
  // const classes = useActionStyles();
  const { t } = useTranslation('SeismicData');
  return (
    <>
      <Button
        variant="default"
        onClick={handleClose}
        data-testid="seismic-modal-close"
      >
        {t('Close')}
      </Button>
      {/*
      <Select
        items={options}
        keyField="ident"
        renderDisplay={(item) => {
          return (
            <span className={classes.item}>
              <img className={classes.img} src={item.logo} alt="vendor logo" />
              <Typography variant="body2">{item.title}</Typography>
            </span>
          );
        }}
        onClick={handleOpenWith}
      >
        <Button variant="outline">{t('Open in')}</Button>
      </Select>
      */}
    </>
  );
};

const renderSelectItem = (
  item: Slices,
  checked: boolean,
  disabled: boolean,
  onChange: (item: Slices) => void
) => {
  if (!(item.file && item.file.name)) {
    return null;
  }
  const handleOnChange = () => onChange(item);

  return (
    <span>
      <Checkbox
        name={item.file.name}
        disabled={disabled}
        checked={checked}
        onChange={handleOnChange}
      >
        {item.file.name}
      </Checkbox>
    </span>
  );
};

interface Props {
  isOpen: boolean;
  // sliceCollection: SeismicCollection;
  onClose: () => void;
}

export const SeismicModalComparer: React.FC<Props> = ({ isOpen, onClose }) => {
  const [sliceCollection, setSliceCollection] = useState<
    SeismicCollection | undefined
  >();
  const [selectedSlice, setSelectedSlice] = useState<Slices | null>(null);
  const [comparingSlices, setComparingSlices] = useState<Slices[]>([]);
  const seismicState = useSeismic();
  const selectedFiles = useSelectedFiles();

  useEffect(() => {
    if (seismicState.sliceCollection) {
      const transformSliceCollection = seismicState.sliceCollection.reduce(
        (accumulator, item) => {
          if (item.id === seismicState.selectedSliceCollectionId) {
            return {
              ...item,
              slices: item.slices.filter((itemSlice) => {
                // Check if the slices' fileid is selected.
                return selectedFiles.some(
                  (selectedItem) => selectedItem.fileId === itemSlice.file.id
                );
              }),
            };
          }
          return accumulator;
        },
        {} as SeismicCollection
      );

      setSliceCollection(transformSliceCollection);
    }
  }, [seismicState.sliceCollection]);

  useEffect(() => {
    if (sliceCollection && sliceCollection.slices.length > 0) {
      setSelectedSlice(sliceCollection.slices[0]);
    }
    setComparingSlices([]);
  }, [sliceCollection]);

  const handleSelectSlice = (slice: Slices) => {
    setSelectedSlice(slice);
  };

  // const handleOpenWith = (option: OptionType) => {
  //   if (option.ident === 'swa') {
  //     if (selectedSlice) {
  //       showInfoMessage('Sending to SWA is disabled.');
  //     }
  //   }
  // };

  const handleSelectComparingSlices = (item: Slices) => {
    if (comparingSlices.includes(item)) {
      setComparingSlices(
        comparingSlices.filter(
          (f) => f.file.dataSetName !== item.file.dataSetName
        )
      );
    } else {
      setComparingSlices([...comparingSlices, item]);
    }
  };

  if (!sliceCollection) {
    return null;
  }

  return (
    <BlankModal visible={isOpen} onCancel={onClose} fullWidth>
      {isOpen && (
        <SeismicHeaderWrapper>
          <SeismicHeader
            sliceCollection={sliceCollection}
            handleSelectSlice={handleSelectSlice}
            handleSelectComparingSlices={handleSelectComparingSlices}
            comparingSlices={comparingSlices}
          />
          <SeismicDisplayContent>
            <SeismicDisplay
              isLoading={sliceCollection.isLoading}
              comparingSlices={comparingSlices}
              slice={selectedSlice}
            />
          </SeismicDisplayContent>
          <Actions handleClose={onClose} />
        </SeismicHeaderWrapper>
      )}
    </BlankModal>
  );
};

interface HeaderProps {
  sliceCollection: SeismicCollection;
  handleSelectSlice: (slice: Slices) => void;
  handleSelectComparingSlices: (item: Slices) => void;
  comparingSlices: Slices[];
}

const SeismicHeader: React.FC<HeaderProps> = (props) => {
  const {
    sliceCollection: { slices },
    handleSelectSlice,
    handleSelectComparingSlices,
    comparingSlices,
  } = props;

  const { t } = useTranslation('SeismicData');
  const isChecked = (item: Slices) => comparingSlices.includes(item);
  const isImageComparerEnabled = comparingSlices.length === 2;
  const isCompareEnabled = () => slices.length > 1;
  const style1 = { display: 'flex', alignItems: 'center' };

  return (
    <Flex>
      <TabsWrapper>
        <Scrollbars autoHeight>
          <Tabs
            onChange={(sliceId: string) => {
              const slice = slices.find((s) => s.id === sliceId);
              if (slice) {
                handleSelectSlice(slice);
              }
            }}
          >
            {slices.map((slice) => (
              <Tabs.TabPane
                key={slice.id}
                tab={
                  <span>
                    {slice.file
                      ? slice.file.dataSetName ||
                        slice.file.name ||
                        slice.file.id
                      : slice.id}
                  </span>
                }
              />
            ))}
          </Tabs>
        </Scrollbars>
      </TabsWrapper>

      <Select<Slices>
        style={style1}
        disableCloseOnClick
        items={slices}
        keyField="file.id"
        renderDisplay={(item) => {
          return renderSelectItem(
            item,
            isChecked(item),
            isImageComparerEnabled && !isChecked(item),
            handleSelectComparingSlices
          );
        }}
      >
        <Button type="tertiary" disabled={!isCompareEnabled()}>
          {t('Compare')}
        </Button>
      </Select>
    </Flex>
  );
};

interface SeismicDisplayProps {
  comparingSlices: Slices[];
  isLoading: boolean;
  slice: Slices | null;
}

const SeismicDisplay: React.FC<SeismicDisplayProps> = (props) => {
  const { comparingSlices, isLoading, slice } = props;
  const isImageComparerEnabled = comparingSlices.length === 2;

  if (isLoading) {
    return <Loader darkMode={false} />;
  }

  if (isImageComparerEnabled) {
    return (
      <ImageComparer
        leftSlice={comparingSlices[0]}
        rightSlice={comparingSlices[1]}
      />
    );
  }

  if (slice) {
    return <SeismicSliceDisplay slice={slice} />;
  }

  return null;
};

const SeismicSliceDisplay = (props: { slice: Slices }) => {
  const { slice } = props;
  if (slice && slice.error) {
    return <SeismicError error={slice.error} />;
  }
  return <SeismicPreview slice={slice} />;
};

const SeismicError = (props: { error: string }) => {
  const { error } = props;
  return (
    <Typography variant="h4" style={{ alignSelf: 'center' }}>
      {error}
    </Typography>
  );
};

export default SeismicModalComparer;
