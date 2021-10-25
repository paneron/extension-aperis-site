/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx, css } from '@emotion/react';
import React from 'react';
import { Breadcrumb, BreadcrumbProps, Breadcrumbs, Menu } from '@blueprintjs/core';
import { Popover2, Popover2InteractionKind } from '@blueprintjs/popover2';
import { navEntryToParentRoute, getRoute, getFullEntryPath } from './util';
import { ROUTES } from './contents';
import { ParsedRoute } from './types';
import NavMenuContents from './NavMenuContents';


const DocsBreadcrumbs: React.FC<{ route: ParsedRoute; currentPath: string; onNavigate?: (e: React.MouseEvent, path: string) => void; }> =
function ({ route, currentPath, onNavigate }) {
  const breadcrumbs: BreadcrumbProps[] = [...route.parentRoutes, navEntryToParentRoute(route.entry)].map((pr, prIdx) => {
    const fullPath = getFullEntryPath(pr.path, route.parentRoutes.slice(0, prIdx));
    const current = fullPath === currentPath;
    return {
      icon: prIdx === 0 ? 'help' : undefined,
      text: pr.title,
      onClick: onNavigate && !current
        ? (e: React.MouseEvent) => onNavigate!(e, fullPath)
        : undefined,
      iconTitle: fullPath,
      current,
    };
  });

  function renderer(props: BreadcrumbProps): JSX.Element {
    if (!props.iconTitle) {
      return <Breadcrumb
        {...props}
        css={css`white-space: nowrap;`}
        href={undefined} />;
    }
    const fullPath = props.iconTitle;
    const thisRoute = getRoute(ROUTES, fullPath);
    const parentPathComponents = fullPath.split('/');
    const parentPath = `${parentPathComponents.slice(0, parentPathComponents.length - 2).join('/')}/`;
    const parentRoute = getRoute(ROUTES, parentPath);
    return (
      <Popover2
        interactionKind={Popover2InteractionKind.HOVER}
        minimal
        content={thisRoute && parentRoute && fullPath !== '/' && (parentRoute.entry.children ?? []).length > 0
          ? <Menu title={`${fullPath} ${JSON.stringify(parentRoute, undefined, 2)}`}>
              <NavMenuContents
                entries={parentRoute.entry.children!}
                parentRoutes={thisRoute.parentRoutes}
                currentPath={fullPath}
                onNavigate={onNavigate} />
            </Menu>
          : undefined}
        placement="bottom-start">
        <Breadcrumb
          {...props}
          href={undefined}
          css={css`white-space: nowrap; ${!props.current ? 'font-size: 100%;' : ''}`}
        />
      </Popover2>
    );
  }

  return (
    <Breadcrumbs breadcrumbRenderer={renderer} items={breadcrumbs} />
  );
};


export default DocsBreadcrumbs;
