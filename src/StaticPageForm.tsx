/** @jsx jsx */
/** @jsxFrag React.Fragment */

//import log from 'electron-log';
import { css, jsx } from '@emotion/react';
import React, { useContext, useEffect, useState } from 'react';

import {
  Button, ButtonGroup, Colors,
  H6, InputGroup,
} from '@blueprintjs/core';

import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';

import { isProseMirrorStructure, type StaticPage } from './types';
import { getMediaDir, posixBasename, PROSEMIRROR_DOC_STUB } from './util';
import { ContentsEditor, SummaryEditor } from './prosemirror/editor';
import MenuWrapper from './widgets/MenuWrapper';
import { FieldWithErrors, type PartialValidator } from './formValidation';
import PageSection from './PageSection';
import { DetailWrapper } from './detail/util';
import { AperisContext } from './context';


const validateDocPageData: PartialValidator<StaticPage> = (page) => {
  const title = (page.title || '').trim() === ''
    ? [{ message: "Title must not be empty" }]
    : [];

  return [{
    title,
  }, title.length < 1];
}


const StaticPageForm: React.FC<{
  pagePath: string
  pageData: StaticPage
  onSave?: (originalPageData: StaticPage, newPageData: StaticPage) => Promise<void>
}> =
function ({
  pageData,
  pagePath,
  onSave,
}) {
  const { makeAbsolutePath } = useContext(DatasetContext);
  const { previewedMediaPath } = useContext(AperisContext);

  const [contentsExpanded, expandContents] = useState<boolean | undefined>(true);
  const [resetCounter, updateResetCounter] = useState(0);

  const mediaDir = getMediaDir('page', pagePath);
  const mediaDirAbsolute = makeAbsolutePath(mediaDir);

  const originalData = pageData;
  const [editedData, updateEditedData] = useState<null | StaticPage>(null);
  const page: StaticPage = (onSave ? editedData : null) ?? originalData ?? null;

  useEffect(() => {
    if (onSave && editedData !== null && JSON.stringify(originalData) === JSON.stringify(editedData)) {
      updateEditedData(null);
    }
  }, [JSON.stringify(originalData), JSON.stringify(editedData)]);

  const canEdit = onSave !== undefined;

  const [validationErrors, isValid] = editedData !== null
    ? validateDocPageData(editedData)
    : [{}, false];

  async function handleSave() {
    if (editedData !== null && onSave) {
      await onSave(originalData, editedData);
    }
  }

  function handleDiscard() {
    if (editedData !== null) {
      updateEditedData(null);
      updateResetCounter(c => c + 1);
    }
  }


  async function handleChooseImage(e: MouseEvent): Promise<string | undefined> {
    if (previewedMediaPath) {
      return posixBasename(previewedMediaPath);
    } else {
      return undefined;
    }
  }

  const initialContents: Record<string, any> | null =
    originalData?.contents && isProseMirrorStructure(originalData.contents)
      ? originalData.contents.doc
      : null;

  const initialSummary: Record<string, any> | null =
    originalData?.summary && isProseMirrorStructure(originalData.summary)
      ? originalData.summary.doc
      : null;
  //console.debug("Doc page data", pageData);

  return (
    <DetailWrapper>

      <PageSection
          expanded={!contentsExpanded}
          onExpand={(state) => expandContents(!state)}
          title="Meta">
        <div css={css`flex-shrink: 0; padding: .5rem 1rem; overflow: hidden; display: flex; flex-flow: column nowrap; & > :not(:last-child) { margin-bottom: .5rem; }`}>
          <FieldWithErrors errors={validationErrors.title ?? []}>
            <InputGroup
              fill
              large
              css={css`& input { font-weight: bold; }`}
              placeholder="Page title"
              value={page.title ?? ''}
              disabled={!canEdit}
              onChange={canEdit
                ? (evt: React.FormEvent<HTMLInputElement>) =>
                    updateEditedData({ ...page!, title: evt.currentTarget.value })
                : undefined}
            />
          </FieldWithErrors>
        </div>

        <H6
            css={css`
              color: ${Colors.GRAY2}; margin-left: 1rem; margin-top: .5rem;
              ${contentsExpanded ? css`display: none` : ''}
            `}>
          Summary
        </H6>

        <SummaryEditor
          css={contentsExpanded ? css`display: none` : undefined}
          key={`${pagePath}=${JSON.stringify(initialSummary ?? {})}-${resetCounter}`}
          onChange={canEdit ?
            ((newDoc) => updateEditedData({ ...page!, summary: { doc: newDoc } }))
            : undefined}
          initialDoc={initialSummary || PROSEMIRROR_DOC_STUB }
          logger={console}
        />
      </PageSection>

      <PageSection
          title="Contents"
          expanded={contentsExpanded}
          onExpand={expandContents}
          css={css`flex: 1; min-height: 30vh`}>
        <ContentsEditor
          css={css`flex: 1;`}
          key={`${pagePath}=${JSON.stringify(initialContents ?? {})}-${resetCounter}-${previewedMediaPath}`}
          mediaDir={mediaDirAbsolute}
          onChooseImageClick={previewedMediaPath ? handleChooseImage : undefined}
          onChange={canEdit
            ? ((newDoc) => updateEditedData({ ...page!, contents: { doc: newDoc } }))
            : undefined}
          initialDoc={initialContents ?? PROSEMIRROR_DOC_STUB}
          logger={console}
        />
      </PageSection>

      <MenuWrapper>
        <ButtonGroup>
          <Button
              intent="success"
              disabled={!onSave || editedData === null || !isValid}
              onClick={handleSave}>
            Commit new version
          </Button>
          <Button disabled={editedData === null || !onSave} onClick={handleDiscard}>
            Discard
          </Button>
        </ButtonGroup>
      </MenuWrapper>

      {/*
        <pre css={{ fontSize: '80%', overflowY: 'auto', height: '20vh' }}>
          {editedContents ? JSON.stringify(editedContents, undefined, 4) : null}
        </pre>
      */}

    </DetailWrapper>
  );
};

export default StaticPageForm;
