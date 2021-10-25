import { NavEntry, ParentRoute, ParsedRouteMap, ParsedRoute } from './types';


/**
 * Given a list of nested navigation entries,
 * builds a flat dictionary of routes keyed by slash-prepended path.
 */
export function buildRoutes(nav: NavEntry[], parentRoutes: ParentRoute[]): ParsedRouteMap {
  const routes: { [path: string]: ParsedRoute; } = {};

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

export function getFullEntryPath(entryPath: string, parentRoutes: ParentRoute[]): string {
  return `${parentRoutes.map(pr => pr.path).join('')}${entryPath}`;
}

export function navEntryToParentRoute(entry: NavEntry): ParentRoute {
  return {
    title: entry.route.title,
    path: entry.path,
  };
}

export function getRoute(routeMap: ParsedRouteMap, path: string): ParsedRoute | undefined {
  return routeMap[path as keyof typeof routeMap];
}
