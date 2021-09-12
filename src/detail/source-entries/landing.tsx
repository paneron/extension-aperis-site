/** @jsx jsx */
/** @jsxFrag React.Fragment */

import log from 'electron-log';
import { Button, ButtonGroup, NonIdealState } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import { useContext, useState } from 'react';
import { AperisContext } from '../../context';
import { SummaryEditor } from '../../prosemirror/editor';
import MenuWrapper from '../../widgets/MenuWrapper';
import { SourceEntryView, LandingPage, isProseMirrorStructure } from '../../types';
import { PROSEMIRROR_DOC_STUB } from '../../util';
import { DetailWrapper } from '../util';


const LandingPageDetail: SourceEntryView<LandingPage> = function ({ entryData, entryPath }) {
  const originalData = entryData;
  const { operations } = useContext(AperisContext);

  const [editedData, updateEditedData] = useState<LandingPage | null>(null);
  const [resetCounter, updateResetCounter] = useState(0);

  const initialWelcomeMessage: Record<string, any> | null =
    originalData?.welcomeNotice && isProseMirrorStructure(originalData.welcomeNotice)
      ? originalData.welcomeNotice.doc
      : null;

  const canEdit = operations !== undefined;
  const data: LandingPage = (canEdit ? editedData : null) ?? originalData;

  if (data === null) {
    return <NonIdealState icon="heart-broken" title="Failed to load landing page data" />;
  }

  async function handleSave() {
    if (editedData !== null && canEdit) {
      await operations.landingPage.replace('', 'change something', originalData, editedData);
    }
  }

  function handleDiscard() {
    if (editedData !== null) {
      updateEditedData(null);
      updateResetCounter(c => c + 1);
    }
  }

  return (
    <DetailWrapper>
      <SummaryEditor
        css={css`flex: 1;`}
        key={`${JSON.stringify(initialWelcomeMessage ?? {})}-${resetCounter}`}
        onChange={canEdit ?
          ((newDoc) => updateEditedData({ ...data!, welcomeNotice: { doc: newDoc } }))
          : undefined}
        initialDoc={initialWelcomeMessage || PROSEMIRROR_DOC_STUB }
        logger={log}
      />

      <MenuWrapper>
        <ButtonGroup>
          <Button
              intent="success"
              disabled={!canEdit || editedData === null}
              onClick={handleSave}>
            Commit new version
          </Button>
          <Button
              disabled={editedData === null || !canEdit}
              onClick={handleDiscard}>
            Discard
          </Button>
        </ButtonGroup>
      </MenuWrapper>
    </DetailWrapper>
  );
}

const LandingPageTitle: SourceEntryView<LandingPage> = function ({ entryData, entryPath }) {
  return <span>Landing page</span>;
}

export default { main: LandingPageDetail, title: LandingPageTitle, plainTitle: async () => "landing page" };
