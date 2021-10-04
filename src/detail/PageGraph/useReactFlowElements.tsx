/** @jsx jsx */
/** @jsxFrag React.Fragment */

import log from 'electron-log';
import update from 'immutability-helper';
import React, { useContext, useEffect, useState } from 'react';
import { Elements, Node, Edge } from 'react-flow-renderer';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { ObjectDatasetRequest, ObjectDatasetResponse } from '@riboseinc/paneron-extension-kit/types';
import useDebounce from '@riboseinc/paneron-extension-kit/useDebounce';
import { LandingPage, StaticPage } from '../../types';
import useHasRootEntries from '../../useHasRootEntries';
import { getParentPagePath } from '../../util';


/** Returns a set of React Flow elements representing Aperis site structure. */
export default function useReactFlowElements(): Elements | undefined | null {
  const { landingPage: landingExists, topLevelPage: topLevelStaticPageExists } = useHasRootEntries();

  const [elements, updateElements] = useState<Elements>([]);

  const {
    useFilteredIndex, useIndexDescription,
    //getFilteredIndexPosition,
    getObjectPathFromFilteredIndex, getObjectData, logger: log,
  } = useContext(DatasetContext);

  const pagesIndexReq = useFilteredIndex({
    queryExpression: `return objPath.startsWith('/pages/') && objPath.endsWith('index.yaml')`,
  });

  const pagesIndexID: string = pagesIndexReq.value.indexID ?? '';
  const indexDescReq = useIndexDescription({ indexID: pagesIndexID });
  const indexProgress = indexDescReq.value.status.progress;
  const itemCount = useDebounce(indexDescReq.value.status.objectCount, 500);

  const hasRootElements: boolean | undefined = landingExists === true && topLevelStaticPageExists === true
    ? true
    : landingExists === undefined || topLevelStaticPageExists === undefined
      ? undefined
      : false;

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (hasRootElements === true && !initialized && !indexProgress) {
      setInitialized(true);
      buildBasicNodes();
    }
  }, [hasRootElements, indexProgress]);

  useEffect(() => {
    buildMissingPageElements().catch(err => log.error("Failed to building missing page nodes", err));
  }, [itemCount]);

  async function getLandingNode(): Promise<Node> {
    const data = await getSingleEntryData<LandingPage>('/index.yaml', getObjectData);
    return landingPageToUnpositionedNode(data);
  }

  async function getPageNode(pagePath: string, idx?: number): Promise<Node> {
    const data = await getSingleEntryData<StaticPage>(pagePath, getObjectData);
    return pageToUnpositionedNode(pagePath, data);
  }

  function getEdge(pagePath1: string, pagePath2: string): Edge {
    return {
      id: `${pagePath1}-to-child-${pagePath2}`,
      source: pagePath1,
      target: pagePath2,
    };
  }

  async function buildBasicNodes() {
    const landingEl = await getLandingNode();
    const topLevelPageEl = await getPageNode('/pages/index.yaml');
    updateElements(els => update(els, {
      $push: [
        landingEl,
        topLevelPageEl,
        getEdge('/index.yaml', '/pages/index.yaml'),
      ]
    }));
  }

  async function buildMissingPageElements() {
    log.debug("Building missing page nodes", itemCount);
    const stubs: number[] = [...new Array(itemCount)].map((_, idx) => idx);
    for (const position of stubs) {
      log.debug("Getting filtered object path", position);
      let entryPath: string = '';
      try {
        const resp = await getObjectPathFromFilteredIndex({ indexID: pagesIndexID, position });
        log.debug("Got filtered object path", position, resp.objectPath);
        entryPath = resp.objectPath;
      } catch (e) {
        log.error("Error getting filtered object path", position, e);
        continue;
      }
      if ((entryPath ?? '').trim() !== '' && entryPath !== '/index.yaml' && entryPath !== '/pages/index.yaml') {
        const alreadyExists = elements.find(el => el.id === entryPath);
        const parentPath = getParentPagePath(entryPath);
        if (!alreadyExists && parentPath !== null) {
          const pageEl = await getPageNode(entryPath);
          updateElements(els => update(els, {
            $push: [
              pageEl,
              getEdge(parentPath, entryPath),
            ]
          }));
        }
      }
    }
  }

  if (hasRootElements) {
    return elements;
  } else if (hasRootElements === undefined) {
    return undefined;
  } else {
    return null;
  }
}


async function getSingleEntryData<T extends StaticPage | LandingPage>(
  entryPath: string,
  getter: (opts: ObjectDatasetRequest) => Promise<ObjectDatasetResponse>
): Promise<T> {
  const result = await getter({ objectPaths: [entryPath] });
  const entryData = result.data[entryPath];
  if (entryData) {
    return entryData as T;
  } else {
    log.error("Failed to get entry data", entryPath);
    throw new Error("Failed to retrieve entry data");
  }
}

function pageToUnpositionedNode(pagePath: string, page: StaticPage, idx?: number): Node<{ label: JSX.Element; idx?: number; }> {
  return {
    id: pagePath,
    type: 'default',
    position: { x: 0, y: 0 },
    data: {
      label: <>{page.title}</>,
      idx,
    },
  };
}

function landingPageToUnpositionedNode(page: LandingPage): Node {
  return {
    id: '/index.yaml',
    type: 'input',
    position: { x: 0, y: 0 },
    data: {
      label: <>Landing page</>,
    },
  };
}
