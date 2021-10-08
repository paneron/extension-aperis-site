/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext } from 'react';
import { jsx } from '@emotion/react';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import { AperisContext } from '../context';
import { Button } from '@blueprintjs/core';
import useSingleSourceEntryData from '../useSingleSourceEntryData';
import { StaticPage } from '../types';
import { SOURCE_ENTRY } from '../protocolRegistry';
import { getParentPagePath } from '../util';


const ParentPage: React.VoidFunctionComponent<Record<never, never>> =
function () {
  const { spawnTab } = useContext(TabbedWorkspaceContext);
  const { lastSelectedSourceEntry: { type: parentType, path: selectedPath } } = useContext(AperisContext);
  const parentPagePath = getParentPagePath(selectedPath);
  const parentPageDataResp = useSingleSourceEntryData<StaticPage>(parentPagePath ?? selectedPath);
  const parentPageData = parentPageDataResp.value;
  const hasParentPage = parentType === 'page' && parentPagePath;

  return (
    <Button
        minimal
        icon={hasParentPage ? 'document' : undefined}
        disabled={!hasParentPage}
        loading={parentPageDataResp.isUpdating}
        onClick={parentPagePath ? () => spawnTab(`${SOURCE_ENTRY}:${parentPagePath}`) : undefined}>
      {(hasParentPage ? parentPageData?.title : 'N/A') ?? '(unknown)'}
    </Button>
  );
};

export default ParentPage;
