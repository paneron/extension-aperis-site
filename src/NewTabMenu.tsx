/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext } from 'react';
import { jsx } from '@emotion/react';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import { DOCS, PAGE_GRAPH, POST_ARCHIVE, SITE_SETTINGS, SOURCE_ENTRY } from './protocolRegistry';
import { AperisContext } from './context';
import { IconSize, Menu, MenuDivider, MenuItem, Spinner } from '@blueprintjs/core';
import useHasRootEntries from './useHasRootEntries';


const NewTabMenu: React.FC<Record<never, never>> = function () {
  const { spawnTab } = useContext(TabbedWorkspaceContext);
  const { siteSettings, operations } = useContext(AperisContext);
  const {
    landingPage: landingExists,
    topLevelPage: topLevelStaticPageExists,
  } = useHasRootEntries();

  const pageItem = topLevelStaticPageExists === true
    ? <MenuItem
        icon="search-around"
        text="Page graph"
        onClick={() => spawnTab(`${PAGE_GRAPH}:index`)}
      />
    : topLevelStaticPageExists === undefined
      ? <MenuItem disabled icon={<Spinner size={IconSize.STANDARD} />} />
      : <MenuItem
          icon="document"
          text="Create top-level static page"
          intent="primary"
          onClick={async () => {
            if (operations) {
              await operations.pages.create('/pages/index.yaml', { title: "Home" });
              spawnTab(`${SOURCE_ENTRY}:/pages/index.yaml`);
            }
          }}
        />;

  const settingsItem = siteSettings !== null
    ? <MenuItem
        icon="settings"
        text="Site settings"
        onClick={() => spawnTab(`${SITE_SETTINGS}:index`)}
      />
    : <MenuItem
        icon="settings"
        intent="primary"
        text="Set up site"
        onClick={() => spawnTab(`${SITE_SETTINGS}:index`)}
      />;

  const helpItem = <MenuItem
    icon="help"
    text="View documentation"
    onClick={() => spawnTab(`${DOCS}:index`)}
  />;

  const prompt = landingExists === true
    ? <Menu>
        <MenuDivider title="Pages" />
        {pageItem}
        <MenuItem
          icon="globe"
          text="Edit landing page"
          onClick={() => spawnTab(`${SOURCE_ENTRY}:/index.yaml`)} />
        <MenuDivider title="Posts" />
        <MenuItem icon="edit" text="Draft a new post" disabled />
        <MenuItem disabled icon="calendar" text="Post archive" onClick={() => spawnTab(`${POST_ARCHIVE}:index`)} />
        <MenuDivider />
        {settingsItem}
        <MenuDivider />
        {helpItem}
      </Menu>
    : landingExists === undefined
      ? <Spinner />
      : <Menu>
          <MenuItem
            icon="globe"
            intent="primary"
            text="Create main landing page"
            disabled={!operations}
            onClick={async () => {
              if (operations) {
                await operations.landingPage.create('', {});
                spawnTab(`${SOURCE_ENTRY}:/index.yaml`);
              }
            }} />
          {helpItem}
        </Menu>;

  return prompt;
};


export default NewTabMenu;
