/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Icon } from '@blueprintjs/core';
import React from 'react';
import { css, jsx } from '@emotion/react';
import type { SuperSidebarConfig } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/types';
import HelpTooltip from '@riboseinc/paneron-extension-kit/widgets/HelpTooltip';
import Search from './Search';
import Subpages from './Subpages';
import Media from './Media';
import AddMedia from './AddMedia';
import ParentPage from './ParentPage';
import Redirects from './Redirects';
import Importance from './Importance';
import MovePage from './MovePage';
import PagePath from './PagePath';
import Site from './Site';


export const sidebarIDs = [
  'Search',
  'Media',
  'Structure',
  'Site',
  //'History',
] as const;

export type SidebarID = typeof sidebarIDs[number];

export const sidebarConfig: SuperSidebarConfig<SidebarID> = {
  Search: {
    icon: () => <Icon icon="search" />,
    title: "Search",
    blocks: [{
      key: 'search',
      title: "Search",
      content: <Search css={css`position: absolute; inset: 0;`} />,
      nonCollapsible: true,
    }],
  },
  // History: {
  //   icon: () => <Icon icon="history" />,
  //   title: "History",
  //   blocks: [{
  //     key: 'timestamps',
  //     title: "Timestamps",
  //     content: <>Coming soon</>,
  //   }, {
  //     key: 'commits',
  //     title: "Commits",
  //     content: <>Coming soon</>,
  //   }],
  // },
  Media: {
    icon: () => <Icon icon="media" />,
    title: "Illustrations",
    blocks: [{
      key: 'existing',
      title: <>
        Available illustrations
        &ensp;
        <HelpTooltip content="To add an illustration in the content of selected page (wrapped as a figure), select an illustration here and click “Insert image” in editor toolbar." />
      </>,
      content: <Media />,
      nonCollapsible: true,
    }, {
      key: 'add',
      title: "Add an illustration",
      content: <AddMedia />,
    }],
  },
  Structure: {
    icon: () => <Icon icon="diagram-tree" />,
    title: "Structure",
    blocks: [{
      key: 'parent',
      title: "Parent page",
      content: <ParentPage />,
    }, {
      key: 'path',
      title: "Path",
      content: <PagePath />,
    }, {
      key: 'importance',
      title: "Importance among siblings",
      content: <Importance />,
    }, {
      key: 'children',
      title: "Subpages",
      content: <Subpages />,
    }, {
      key: 'redirects',
      title: "Redirects to here",
      content: <Redirects />,
    }, {
      key: 'move',
      title: "Move page",
      content: <MovePage />,
      collapsedByDefault: true,
    }],
  },
  Site: {
    icon: () => <Icon icon="globe" />,
    title: "Publishing",
    blocks: [{
      key: 'site',
      title: "Site",
      content: <Site />,
      nonCollapsible: true,
    }],
  },
};
