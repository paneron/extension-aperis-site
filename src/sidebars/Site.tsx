/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext } from 'react';
import { jsx } from '@emotion/react';
import { Button } from '@blueprintjs/core';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import { AperisContext } from '../context';
import PropertyView, { TextInput } from '@riboseinc/paneron-extension-kit/widgets/Sidebar/PropertyView';
import { SITE_SETTINGS } from '../protocolRegistry';


const Site: React.VoidFunctionComponent<Record<never, never>> =
function () {
  const { siteSettings } = useContext(AperisContext);
  const { spawnTab } = useContext(TabbedWorkspaceContext);

  return (
    <>
      <PropertyView label="Site title">
        <TextInput value={siteSettings?.title ?? '(N/A)'} />
      </PropertyView>
      <PropertyView label="Deployment workflow">
        <TextInput value={siteSettings?.deploymentSetup ?? '(N/A)'} />
      </PropertyView>
      <Button
          fill
          onClick={() => spawnTab(`${SITE_SETTINGS}:index`)}
          icon="maximize">
        Open in new tab
      </Button>
    </>
  );
};

export default Site;
