/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { MenuItem } from '@blueprintjs/core';
import { jsx } from '@emotion/react';
import React from 'react';
import { NavEntry, ParentRoute } from './types';
import { getFullEntryPath, navEntryToParentRoute } from './util';


interface NavMenuContentsProps {
  entries: NavEntry[];
  parentRoutes: ParentRoute[];
  onNavigate?: (e: React.MouseEvent, path: string) => void
  currentPath?: string;
  enterChildren?: true;
  className?: string;
}

const NavMenuContents: React.VoidFunctionComponent<NavMenuContentsProps> =
function ({ entries, onNavigate, enterChildren, parentRoutes, currentPath, className }) {
  return <>
    {entries.map(entry => <MenuItem
      key={entry.path}
      text={entry.route.title}
      className={className}
      active={currentPath !== undefined && getFullEntryPath(entry.path, parentRoutes) === currentPath}
      title={`Current path: ${currentPath}, entry full path: ${getFullEntryPath(entry.path, parentRoutes)}`}
      disabled={!onNavigate}
      onClick={onNavigate ? e => onNavigate!(e, getFullEntryPath(entry.path, parentRoutes)) : undefined}
      children={entry.children && enterChildren
        ? <NavMenuContents
            entries={entry.children}
            onNavigate={onNavigate}
            className={className}
            currentPath={currentPath}
            parentRoutes={[...parentRoutes, navEntryToParentRoute(entry)]}
          />
        : undefined}
    />)}
  </>;
};

export default NavMenuContents;
