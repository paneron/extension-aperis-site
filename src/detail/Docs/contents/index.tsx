import { NavEntry } from '../types';
import { buildRoutes } from '../util';

import About from './About';
import Restructuring from './Topic_Restructuring';
import Links from './HowTo_Link';
import Illustrations from './HowTo_Illustration';
import Editing_Basics from './Topic_SemanticEditing';


export const NAV: NavEntry[] = [
  {
    path: '/', route: { title: "Aperis extension docs" }, children: [
      { path: 'about/', route: { component: About, title: "About" } },
      { path: 'topics/', route: { title: "Topics" }, children: [
        { path: 'semantic-editing/', route: { component: Editing_Basics, title: "Semantic text editing" } },
        { path: 'restructuring/', route: { component: Restructuring, title: "Restructuring sites" } },
      ] },
      { path: 'how-tos/', route: { title: "How-to guides" }, children: [
        { path: 'insert-link/', route: { component: Links, title: "Insert a link" } },
        { path: 'insert-illustration/', route: { component: Illustrations, title: "Insert an illustration" } },
      ] },
    ]
  },
];

export const ROUTES = buildRoutes(NAV, []);
