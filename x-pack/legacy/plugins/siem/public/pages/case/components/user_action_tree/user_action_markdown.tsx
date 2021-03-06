/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { EuiFlexGroup, EuiFlexItem, EuiButtonEmpty, EuiButton } from '@elastic/eui';
import React, { useCallback } from 'react';
import styled, { css } from 'styled-components';

import * as i18n from '../case_view/translations';
import { Markdown } from '../../../../components/markdown';
import { Form, useForm, UseField } from '../../../../shared_imports';
import { schema, Content } from './schema';
import { InsertTimelinePopover } from '../../../../components/timeline/insert_timeline_popover';
import { useInsertTimeline } from '../../../../components/timeline/insert_timeline_popover/use_insert_timeline';
import { MarkdownEditorForm } from '../../../../components/markdown_editor/form';

const ContentWrapper = styled.div`
  ${({ theme }) => css`
    padding: ${theme.eui.euiSizeM} ${theme.eui.euiSizeL};
  `}
`;

interface UserActionMarkdownProps {
  content: string;
  id: string;
  isEditable: boolean;
  onChangeEditable: (id: string) => void;
  onSaveContent: (content: string) => void;
}
export const UserActionMarkdown = ({
  id,
  content,
  isEditable,
  onChangeEditable,
  onSaveContent,
}: UserActionMarkdownProps) => {
  const { form } = useForm<Content>({
    defaultValue: { content },
    options: { stripEmptyFields: false },
    schema,
  });
  const { handleCursorChange, handleOnTimelineChange } = useInsertTimeline<Content>(
    form,
    'content'
  );
  const handleCancelAction = useCallback(() => {
    onChangeEditable(id);
  }, [id, onChangeEditable]);

  const handleSaveAction = useCallback(async () => {
    const { isValid, data } = await form.submit();
    if (isValid) {
      onSaveContent(data.content);
    }
    onChangeEditable(id);
  }, [form, id, onChangeEditable, onSaveContent]);

  const renderButtons = useCallback(
    ({ cancelAction, saveAction }) => {
      return (
        <EuiFlexGroup gutterSize="s" alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty size="s" onClick={cancelAction} iconType="cross">
              {i18n.CANCEL}
            </EuiButtonEmpty>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton color="secondary" fill iconType="save" onClick={saveAction} size="s">
              {i18n.SAVE}
            </EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup>
      );
    },
    [handleCancelAction, handleSaveAction]
  );
  return isEditable ? (
    <Form form={form}>
      <UseField
        path="content"
        component={MarkdownEditorForm}
        componentProps={{
          bottomRightContent: renderButtons({
            cancelAction: handleCancelAction,
            saveAction: handleSaveAction,
          }),
          onCursorPositionUpdate: handleCursorChange,
          topRightContent: (
            <InsertTimelinePopover
              hideUntitled={true}
              isDisabled={false}
              onTimelineChange={handleOnTimelineChange}
            />
          ),
        }}
      />
    </Form>
  ) : (
    <ContentWrapper>
      <Markdown raw={content} data-test-subj="case-view-description" />
    </ContentWrapper>
  );
};
