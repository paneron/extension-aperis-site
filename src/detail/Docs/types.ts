import React from 'react';

interface Route {
  component?: React.VoidFunctionComponent<Record<never, never>>;
  title: string;
}

export interface ParentRoute {
  path: string;
  title: string;
}

export type ParsedRoute = Route & {
  /** Ordered from furthest parent to closest. */
  parentRoutes: ParentRoute[];

  entry: NavEntry;
}

export interface NavEntry {
  /** No leading slash; always trailing slash. */
  path: string;

  route: Route;
  children?: NavEntry[];
}

export interface ParsedRouteMap {
  [path: string]: ParsedRoute;
}
