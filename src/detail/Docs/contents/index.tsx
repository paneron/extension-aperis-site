import { NavEntry } from '../types';
import { buildRoutes } from '../util';

import Intro from './Intro';
import Restructuring from './Restructuring';
import Editing from './Editing';
import Links from './Editing_Links';


export const NAV: NavEntry[] = [
  {
    path: '/', route: { title: "Aperis extension docs" }, children: [
      { path: 'introduction/', route: { component: Intro, title: "Introduction" } },
      { path: 'editing/', route: { component: Editing, title: "Editing content" }, children: [
        { path: 'links/', route: { component: Links, title: "Working with links" } },
      ] },
      { path: 'restructuring/', route: { component: Restructuring, title: "Restructuring sites" } },
    ]
  },
];

export const ROUTES = buildRoutes(NAV, []);
