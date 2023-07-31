import { Button, Checkbox, Drawer, Input, Textarea } from '@cognite/cogs.js';
import { ColorPicker } from 'components/ColorPicker';
import useSingleTimeSeriesQuery from 'hooks/useQuery/useSingleTimeSeriesQuery';
import { useEffect, useState } from 'react';
import { TimeSeriesTag } from 'typings';

import { FormWrapper } from './elements';
import TimeSeriesPreview from './TimeSeriesPreview';

type TimeSeriesSidebarProps = {
  visible: boolean;
  onClose: () => void;
  onUpdateTimeSeriesTag?: (update: Partial<TimeSeriesTag>) => void;
  timeSeriesTag?: TimeSeriesTag;
};

const TimeSeriesSidebar = ({
  visible,
  onClose,
  onUpdateTimeSeriesTag,
  timeSeriesTag,
}: TimeSeriesSidebarProps) => {
  const { data: timeSeries } = useSingleTimeSeriesQuery(
    timeSeriesTag?.timeSeriesReference
  );
  const [minMaxValues, setMinMaxValues] = useState<{
    min: string;
    max: string;
  }>({
    min: String(
      timeSeriesTag?.rule?.min === undefined ? '' : timeSeriesTag?.rule?.min
    ),
    max: String(
      timeSeriesTag?.rule?.max === undefined ? '' : timeSeriesTag?.rule?.max
    ),
  });

  useEffect(() => {
    setMinMaxValues({
      min: String(
        timeSeriesTag?.rule?.min === undefined ? '' : timeSeriesTag?.rule?.min
      ),
      max: String(
        timeSeriesTag?.rule?.max === undefined ? '' : timeSeriesTag?.rule?.max
      ),
    });
  }, [timeSeriesTag?.rule]);

  const onUpdate = (update: Partial<TimeSeriesTag>) => {
    if (!onUpdateTimeSeriesTag) {
      return;
    }
    onUpdateTimeSeriesTag(update);
  };

  const renderContents = () => {
    if (!timeSeriesTag) {
      return null;
    }

    return (
      <FormWrapper isAdmin>
        <section className="chart">
          {timeSeries && <TimeSeriesPreview timeSeries={timeSeries} />}
        </section>
        <section>
          <h3>Color</h3>
          <ColorPicker
            color={timeSeriesTag.color}
            onColorChange={(color) => {
              onUpdate({
                color,
              });
            }}
          />
        </section>

        <section className="indicator-range">
          <h3>Indicator Range</h3>
          <div className="inputs">
            <Input
              type="text"
              placeholder="Min"
              value={minMaxValues.min === undefined ? '' : minMaxValues.min}
              onChange={(e) => {
                const min = e.target.value;
                setMinMaxValues({
                  min,
                  max: minMaxValues.max,
                });
                if (!Number.isNaN(Number(min))) {
                  onUpdate({
                    rule: {
                      ...timeSeriesTag.rule,
                      min: min === '' ? undefined : Number(min),
                    },
                  });
                }
              }}
            />
            <Input
              type="text"
              placeholder="Max"
              value={minMaxValues.max === undefined ? '' : minMaxValues.max}
              onChange={(e) => {
                const max = e.target.value;
                setMinMaxValues({
                  min: minMaxValues.min,
                  max,
                });
                if (!Number.isNaN(Number(max)) || max === '') {
                  onUpdate({
                    rule: {
                      ...timeSeriesTag.rule,
                      max: max === '' ? undefined : Number(max),
                    },
                  });
                }
              }}
            />
          </div>
        </section>
        <section className="options">
          <h3>Options</h3>
          <div>
            <Checkbox
              name="sticky"
              checked={timeSeriesTag.sticky}
              onChange={() => {
                onUpdate({
                  sticky: !timeSeriesTag.sticky,
                });
              }}
            >
              Always display time series detail
            </Checkbox>
          </div>
          <div>
            <Checkbox
              name="link"
              checked={!!timeSeriesTag.link}
              onChange={() => {
                const isChecked = !timeSeriesTag.link;

                onUpdate({
                  link: isChecked
                    ? {
                        URL: 'https://google.com',
                      }
                    : undefined,
                });
              }}
            >
              Add a link
            </Checkbox>
            <div>
              {!!timeSeriesTag.link && (
                <Input
                  type="text"
                  placeholder="Link"
                  value={timeSeriesTag.link?.URL}
                  onChange={(e) => {
                    const URL = e.target.value;
                    onUpdate({
                      link: {
                        URL,
                      },
                    });
                  }}
                />
              )}
            </div>
          </div>
        </section>

        <section>
          <h3>Comment</h3>
          <Textarea
            placeholder="Comment"
            value={timeSeriesTag.comment}
            onChange={(e) => {
              const comment = e.target.value;
              onUpdate({
                comment,
              });
            }}
          />
        </section>
      </FormWrapper>
    );
  };
  return (
    <Drawer
      visible={visible}
      footer={null}
      width={360}
      onClose={onClose}
      closeIcon={<Button onClick={onClose} icon="Close" type="ghost" />}
      maskStyle={{
        background: 'transparent',
      }}
      title={timeSeries?.name}
    >
      {renderContents()}
    </Drawer>
  );
};

export default TimeSeriesSidebar;
