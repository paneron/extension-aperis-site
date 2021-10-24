/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, H3, Menu, MenuItem, NonIdealState } from '@blueprintjs/core';
import { Popover2, Popover2InteractionKind } from '@blueprintjs/popover2';
import { jsx, css } from '@emotion/react';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import React, { useContext } from 'react';
import { DOCS } from '../../protocolRegistry';

import Intro from './Intro';
import Restructuring from './Restructuring';
import Editing from './Editing';


interface Route {
  component?: React.VoidFunctionComponent<Record<never, never>>
  title: string
};

interface ParentRoute { path: string, title: string }

type ParsedRoute = Route & {
  /** Ordered from closest parent to furthest. */
  parentRoutes: ParentRoute[]

  entry: NavEntry
}

interface NavEntry {
  /** No leading slash; always trailing slash. */
  path: string

  route: Route
  children?: NavEntry[]
};

interface ParsedRouteMap {
  [path: string]: ParsedRoute 
}


const NAV: NavEntry[] = [
  { path: '/', route: { title: "Aperis extension docs" }, children: [
    { path: 'introduction/', route: { component: Intro, title: "What is Aperis?" } },
    { path: 'editing/', route: { component: Editing, title: "Editing content" } },
    { path: 'restructuring/', route: { component: Restructuring, title: "Restructuring sites" } },
  ] },
];

const ROUTES = buildRoutes(NAV, []);


/**
 * Given a list of nested navigation entries,
 * builds a flat dictionary of routes keyed by slash-prepended path.
 */
function buildRoutes(nav: NavEntry[], parentRoutes: ParentRoute[]): ParsedRouteMap {
  const routes: { [path: string]: ParsedRoute } = {};

  for (const item of nav) {
    const fullRoutePath = getFullEntryPath(item.path, parentRoutes);

    routes[fullRoutePath] = { ...item.route, entry: item, parentRoutes };

    if (item.children) {
      const newParentRoutes = [ ...parentRoutes, navEntryToParentRoute(item) ];
      Object.assign(routes, buildRoutes(item.children, newParentRoutes));
    }
  }

  return routes;
}

function getFullEntryPath(path: string, parentRoutes: ParentRoute[]): string {
  return `${parentRoutes.map(pr => pr.path).join('')}${path}`;
}

function navEntryToParentRoute(entry: NavEntry): ParentRoute {
  return {
    title: entry.route.title,
    path: entry.path,
  };
}

function getRoute(routeMap: ParsedRouteMap, path: string): ParsedRoute | undefined {
  return routeMap[path as keyof typeof routeMap];
}

interface NavMenuContentsProps {
  entries: NavEntry[]
  parentRoutes: ParentRoute[]
  enterChildren?: true
  className?: string 
}
const NavMenuContents: React.VoidFunctionComponent<NavMenuContentsProps> =
function ({ entries, enterChildren, parentRoutes, className }) {
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
      onClick={e => handleNavigate(e, getFullEntryPath(entry.path, parentRoutes))}
      children={entry.children && enterChildren
        ? <NavMenuContents
            entries={entry.children}
            className={className}
            parentRoutes={[ ...parentRoutes, navEntryToParentRoute(entry) ]}
          />
        : undefined}
    />)}
  </>;
}


//const Menu: React.VoidFunctionComponent<Record<never, never>> = function () {
//};


const DocsPage: React.FC<{ uri: string }> = React.memo(function ({ uri }) {
  const { spawnTab, navigateFocusedTab } = useContext(TabbedWorkspaceContext);
  function handleNavigateHome(e: React.MouseEvent) {
    const tabURI = `${DOCS}:/`;
    if (e.ctrlKey || e.metaKey) {
      return spawnTab(tabURI);
    } else {
      return (navigateFocusedTab ?? spawnTab)(tabURI);
    }
  }

  let main: JSX.Element;
  const navMenuContents = <Menu>
    <NavMenuContents
      entries={NAV[0]?.children ?? []}
      parentRoutes={[navEntryToParentRoute(NAV[0])]}
      enterChildren
    />
  </Menu>;
  if (uri === 'index') {
    main = <NonIdealState
      icon="help"
      title="Aperis extension docs"
      description={navMenuContents}
    />;
  } else {
    const route = getRoute(ROUTES, uri);
    if (route) {
      const View = route.component;
      main = View
        ? <>
            <H3>{route.title}</H3>
            <View />
          </>
        : <NonIdealState
            icon="help"
            title={route.title}
            description={<Menu>
              <NavMenuContents
                entries={route.entry.children ?? []}
                parentRoutes={[ ...route.parentRoutes, navEntryToParentRoute(route.entry) ]}
              />
            </Menu>}
          />;
    } else {
      main = <NonIdealState
        icon="heart-broken"
        title="Documentation page not found"
        description={<>
          Requested URI: {uri}
          <br />
          Available routes:
          <pre css={css`text-align: left; font-size: 10px; overflow-y: auto;`}>
            {JSON.stringify(ROUTES, undefined, 2)}
          </pre>
        </>}
      />;
    }
  }
  return (
    <div css={css`position: absolute; inset: 0; display: flex; flex-flow: column nowrap;`}>
      <div css={css`flex: 0; padding: 10px;`}>
        <Popover2
            interactionKind={Popover2InteractionKind.HOVER}
            minimal
            content={navMenuContents}
            placement="bottom">
          <Button
              icon="help"
              outlined
              onClick={e => handleNavigateHome(e)}>
            Documentation
          </Button>
        </Popover2>
      </div>
      <div css={css`flex: 1; padding: 0 10px 1rem 10px; overflow-y: auto;`}>
        {main}
      </div>
    </div>
  );
});


const DocsPageTitle: React.FC<{ uri: string }> = function ({ uri }) {
  const route = getRoute(ROUTES, uri);
  if (uri === 'index' || !route) {
    return <>Documentation</>;
  } else {
    return <>Documentation: {route.title}</>;
  }
};


export default {
  main: DocsPage,
  title: DocsPageTitle,
  plainTitle: async (uri: string) => `Documentation: ${getRoute(ROUTES, uri)?.title ?? "Aperis"}`,
};
