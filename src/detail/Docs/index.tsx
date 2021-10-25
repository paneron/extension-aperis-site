/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React, { useContext } from 'react';
import { Classes, H3, Menu, MenuDivider, NonIdealState } from '@blueprintjs/core';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import { DOCS } from '../../protocolRegistry';

import { navEntryToParentRoute, getRoute } from './util';
import NavMenuContents from './NavMenuContents';
import { NAV, ROUTES } from './contents';
import DocsBreadcrumbs from './DocsBreadcrumbs';


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
      onNavigate={handleNavigate}
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
          onNavigate={handleNavigate}
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
      <div css={css`flex: 0; padding: 0 30px 0 15px`}>
        {route
          ? <DocsBreadcrumbs route={route} onNavigate={handleNavigate} currentPath={uri} />
          : undefined}
      </div>
      <div css={css`flex: 1; padding: 15px; overflow-y: auto;`}>
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
