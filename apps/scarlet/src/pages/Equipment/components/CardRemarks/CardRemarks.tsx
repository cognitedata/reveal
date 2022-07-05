import { useCallback, useEffect, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Button, Graphic, Tag, Textarea, toast } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { AppActionType, DataElement, Remark } from 'types';
import { useAppContext } from 'hooks';
import { getTagColor } from 'utils';

import { RemarkTags } from '..';

import * as Styled from './style';

const INPUT_LINE_HEIGHT = 21;

type CardRemarksProps = {
  dataElement: DataElement;
};

export const CardRemarks = ({ dataElement }: CardRemarksProps) => {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const { authState } = useAuthContext();
  const { appState, appDispatch } = useAppContext();
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [remarkId, setRemarkId] = useState(uuid());

  const onChange = useCallback((e) => {
    const { value } = e.target;
    e.target.style.height = '0';
    const rows = Math.floor(e.target.scrollHeight / INPUT_LINE_HEIGHT);
    e.target.style.height = 'auto';
    setMessage(value);
    setRows(Math.min(rows, 4));
  }, []);

  const addRemark = () => {
    if (message.trim() === '') return;

    const remark: Remark = {
      id: remarkId,
      message: message.trim(),
      tags,
      user: {
        id: authState?.id,
        email: authState?.email,
        name: authState?.username,
      },
      timeCreated: Date.now(),
    };

    setIsSaving(true);

    appDispatch({
      type: AppActionType.ADD_REMARK,
      dataElement,
      remark,
    });
  };

  useEffect(() => {
    if (isSaving && !appState.saveState.loading) {
      setIsSaving(false);

      if (appState.saveState.error) {
        toast.error(`Failed to add remark`);
      } else {
        setMessage('');
        setRows(1);
        setTags([]);
        setRemarkId(uuid());
      }
    }
  }, [appState.saveState.loading]);

  const handleSubmit = (e: any) => {
    if (e.keyCode === 13 && e.shiftKey) {
      e.preventDefault();
      addRemark();
    }
  };

  const isEmpty = !dataElement.remarks?.length;

  return (
    <>
      <Styled.Content empty={isEmpty}>
        {isEmpty ? (
          <Styled.EmptyContainer>
            <Graphic type="RuleCreating" />
            <div className="cogs-micro">Your remarks will show here</div>
          </Styled.EmptyContainer>
        ) : (
          <Styled.RemarksContainer>
            {dataElement.remarks?.map((remark) => (
              <div key={remark.id}>
                <Styled.RemarkMessage className="cogs-body-3" key={remark.id}>
                  {remark.message}
                </Styled.RemarkMessage>
                {!!remark.tags?.length && (
                  <Styled.RemarkTags>
                    {remark.tags.map((tag) => (
                      <Tag key={tag} color={getTagColor(tag)}>
                        {tag}
                      </Tag>
                    ))}
                  </Styled.RemarkTags>
                )}
                <Styled.RemarkFooter className="cogs-micro">
                  Sent by{' '}
                  <Styled.RemarkUser>
                    {authState?.id === remark.user.id
                      ? 'You'
                      : remark.user.email}
                  </Styled.RemarkUser>
                  . {getRemarkDate(remark.timeCreated)}
                </Styled.RemarkFooter>
              </div>
            ))}
          </Styled.RemarksContainer>
        )}
      </Styled.Content>

      <RemarkTags
        tags={tags}
        setTags={setTags}
        remarkId={remarkId}
        disabled={isSaving}
      />

      <Styled.TextareaContainer>
        <Textarea
          onChange={onChange}
          name="remark"
          placeholder="Leave remarks here"
          value={message}
          rows={rows}
          onKeyDown={handleSubmit}
          onKeyPress={handleSubmit}
          disabled={isSaving}
        />
        <Button
          type="link"
          icon={isSaving ? 'Loader' : 'Send'}
          aria-label="Send"
          onClick={addRemark}
          disabled={isSaving}
        />
      </Styled.TextareaContainer>
    </>
  );
};

const getRemarkDate = (timestamp: number) => {
  const date = new Date(timestamp);
  if (isToday(date)) return `Today at ${date.toLocaleTimeString('en-US')}`;
  return date.toLocaleDateString('en-US');
};

const isToday = (date: Date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};
