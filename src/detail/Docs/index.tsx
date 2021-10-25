/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Button, ButtonGroup, Classes, H3, Menu, MenuDivider, NonIdealState } from '@blueprintjs/core';
import { Popover2, Popover2InteractionKind } from '@blueprintjs/popover2';
import { jsx, css } from '@emotion/react';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import React, { useContext } from 'react';
import { DOCS } from '../../protocolRegistry';

import { navEntryToParentRoute, getRoute, getFullEntryPath } from './util';
import { NavMenuContents } from './NavMenuContents';
import { NAV, ROUTES } from './contents';


const DocsPage: React.FC<{ uri: string }> = React.memo(function ({ uri }) {
  const { spawnTab, navigateFocusedTab } = useContext(TabbedWorkspaceContext);
  function handleNavigate(e: React.MouseEvent, uri: string) {
    const tabURI = `${DOCS}:${uri}`;
    if (e.ctrlKey || e.metaKey) {
      return spawnTab(tabURI);
    } else {
      return (navigateFocusedTab ?? spawnTab)(tabURI);
    }
  }

  let main: JSX.Element;
  const navMenuContents = <Menu>
    <NavMenuContents
      currentPath={uri}
      entries={NAV[0]?.children ?? []}
      parentRoutes={[navEntryToParentRoute(NAV[0])]}
      enterChildren
    />
  </Menu>;

  const route = getRoute(ROUTES, uri);

  if (uri === 'index') {
    main = <NonIdealState
      icon="help"
      title="Aperis extension docs"
      description={navMenuContents}
    />;

  } else {
    if (route) {
      const View = route.component;

      const inThisSection = <Menu className={Classes.ELEVATION_2}>
        {route.parentRoutes.length > 0
          ? <MenuDivider title="Further in this section" />
          : null}
        <NavMenuContents
          entries={route.entry.children ?? []}
          parentRoutes={[ ...route.parentRoutes, navEntryToParentRoute(route.entry) ]}
        />
      </Menu>;

      main = View
        ? <>
            <H3>{route.title}</H3>
            <View />
            {route.entry.children
              ? <footer>
                  {inThisSection}
                </footer>
              : null}
          </>
        : <NonIdealState
            icon="help"
            title={route.title}
            description={inThisSection}
          />;

    } else {
      main = <NonIdealState
        icon="heart-broken"
        title="Documentation page not found"
        description={<>
          Requested URI: {uri}
          <br />
          Available routes:
          <pre css={css`text-align: left; font-size: 10px; overflow-y: auto; max-height: 20vh;`}>
            {JSON.stringify(ROUTES, undefined, 2)}
          </pre>
        </>}
      />;
    }
  }

  return (
    <div css={css`position: absolute; inset: 0; display: flex; flex-flow: column nowrap;`}>
      <div css={css`flex: 0; padding: 10px;`}>
        {route
          ? <ButtonGroup>
              {[ ...route.parentRoutes, navEntryToParentRoute(route.entry) ].map((pr, prIdx) => {
                // TODO: Split out into a component
                const fullPath = getFullEntryPath(pr.path, route.parentRoutes.slice(0, prIdx));
                const parentPathComponents = fullPath.split('/');
                const parentPath = `${parentPathComponents.slice(0, parentPathComponents.length - 2).join('/')}/`;
                const parentRoute = getRoute(ROUTES, parentPath);
                return (
                  <Popover2
                      interactionKind={Popover2InteractionKind.HOVER}
                      minimal
                      content={fullPath !== '/' && (parentRoute?.entry.children ?? []).length > 0
                        ? <Menu>
                            <NavMenuContents
                              entries={parentRoute!.entry.children!}
                              parentRoutes={route.parentRoutes.slice(0, prIdx)}
                              currentPath={fullPath}
                            />
                          </Menu>
                        : undefined}
                      placement="bottom">
                    <Button
                        outlined
                        icon="chevron-right"
                        title={`${fullPath} — ${JSON.stringify(parentRoute, undefined, 2)}`}
                        onClick={e => handleNavigate(e, fullPath)}>
                      {pr.title}
                    </Button>
                  </Popover2>
                )
              })}
            </ButtonGroup>
          : undefined}
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
