/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { MenuItem } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import React, { useContext } from 'react';
import { DOCS } from '../../protocolRegistry';
import { NavEntry, ParentRoute } from './types';
import { getFullEntryPath, navEntryToParentRoute } from './util';


interface NavMenuContentsProps {
  entries: NavEntry[];
  parentRoutes: ParentRoute[];
  currentPath?: string;
  enterChildren?: true;
  className?: string;
}

export const NavMenuContents: React.VoidFunctionComponent<NavMenuContentsProps> =
function ({ entries, enterChildren, parentRoutes, currentPath, className }) {
  const { spawnTab, navigateFocusedTab } = useContext(TabbedWorkspaceContext);
  function handleNavigate(e: React.MouseEvent, uri: string) {
    const tabURI = `${DOCS}:${uri}`;
    if (e.ctrlKey || e.metaKey) {
      return spawnTab(tabURI);
    } else {
      return (navigateFocusedTab ?? spawnTab)(tabURI);
    }
  }

  return <>
    {entries.map(entry => <MenuItem
      key={entry.path}
      text={entry.route.title}
      className={className}
      active={currentPath !== undefined && getFullEntryPath(entry.path, parentRoutes) === currentPath}
      title={`Current path: ${currentPath}, entry full path: ${getFullEntryPath(entry.path, parentRoutes)}`}
      onClick={e => handleNavigate(e, getFullEntryPath(entry.path, parentRoutes))}
      children={entry.children && enterChildren
        ? <NavMenuContents
            entries={entry.children}
            className={className}
            currentPath={currentPath}
            parentRoutes={[...parentRoutes, navEntryToParentRoute(entry)]}
          />
        : undefined}
    />)}
  </>;
};
