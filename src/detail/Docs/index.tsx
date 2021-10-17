/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { Menu, MenuItem, NonIdealState } from '@blueprintjs/core';
import { jsx, css } from '@emotion/react';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import React, { useContext } from 'react';
import { DOCS } from '../../protocolRegistry';

// import Start from './Start';
// import Restructuring from './Restructuring';
// import EditingContent from './EditingContent';


interface DocsRoute {
  component: React.VoidFunctionComponent<Record<never, never>>
  title: string
}
const ROUTES = {
  '/start': { component: () => <>Start</>, title: "Getting started" },
  '/restructuring': { component: () => <>How to restructure</>, title: "How to restructure" },
};

function getRoute(path: string): DocsRoute | undefined {
  return ROUTES[path as keyof typeof ROUTES];
}


//const Menu: React.VoidFunctionComponent<Record<never, never>> = function () {
//};


const DocsPage: React.FC<{ uri: string }> = React.memo(function ({ uri }) {
  const { spawnTab } = useContext(TabbedWorkspaceContext);
  let main: JSX.Element;
  if (uri === 'index') {
    main = <NonIdealState icon="help" title="Aperis extension docs" description={
      <Menu>
        <MenuItem text="Getting started" onClick={() => spawnTab(`${DOCS}:/start`)} />
        <MenuItem text="Restructuring" onClick={() => spawnTab(`${DOCS}:/restructuring`)} />
      </Menu>
    } />;
  } else {
    const route = getRoute(uri);
    if (route) {
      const View = route.component;
      main = <View />;
    } else {
      main = <NonIdealState icon="heart-broken" description="Documentation page not found" />;
    }
  }
  return (
    <div css={css`position: absolute; inset: 0;`}>
      {main}
    </div>
  );
});


const DocsPageTitle: React.FC<{ uri: string }> = function ({ uri }) {
  const route = getRoute(uri);
  if (uri === 'index' || !route) {
    return <>Documentation</>;
  } else {
    return <>Documentation: {route.title}</>;
  }
};


export default {
  main: DocsPage,
  title: DocsPageTitle,
  plainTitle: async (uri: string) => `Documentation: ${getRoute(uri)?.title ?? "Aperis"}`,
};
