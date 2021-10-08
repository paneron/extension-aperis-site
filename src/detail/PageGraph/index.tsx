/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update from 'immutability-helper';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { jsx } from '@emotion/react';
import ReactFlow, { Elements, Node, Edge } from 'react-flow-renderer';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import useDebounce from '@riboseinc/paneron-extension-kit/useDebounce';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { AperisContext } from '../../context';
import { DetailWrapper } from '../util';
import { SOURCE_ENTRY } from '../../protocolRegistry';
import augmentWithPosition from './augmentWithPosition';
import useHasRootEntries from '../../useHasRootEntries';
import { LandingPage, StaticPage } from '../../types';
import { getParentPagePath } from '../../util';


const PageGraph: React.FC<{ uri: string }> = React.memo(function ({ uri }) {
  const { selectSourceEntry } = useContext(AperisContext);
  const { spawnTab } = useContext(TabbedWorkspaceContext);

  const els = useReactFlowElements();
  const elsDebounced = useDebounce(els, 300);
  const positionedEls = useMemo(
    () => els ? augmentWithPosition(els, 'TB', 25) : [],
    [JSON.stringify(elsDebounced)],
  );

  function handleElementClick(el: Node | Edge) {
    if (selectSourceEntry) {
      const node = el as Node;
      const pagePath = node.id;
      if (pagePath) {
        selectSourceEntry(pagePath);
      }
    }
  }

  function handleNodeDoubleClick(node: Node) {
    if (node.id) {
      spawnTab(`${SOURCE_ENTRY}:${node.id}`);
    }
  }

  if (els !== null && els !== undefined) {
    return (
      <DetailWrapper>
        <ReactFlow
          elements={positionedEls}
          nodesConnectable={false}
          draggable={false}
          onNodeDoubleClick={(evt, node) => handleNodeDoubleClick(node)}
          onElementClick={(evt, el) => handleElementClick(el)}
        />
      </DetailWrapper>
    );
  } else if (els === undefined) {
    return <NonIdealState
      icon={<Spinner />}
    />;
  } else {
    return <NonIdealState
      icon="info-sign"
      title="Please create landing page and top-level static page first."
    />;
  }
});


const PageGraphTitle: React.FC<{ uri: string }> = function ({ uri }) {
  return <>Page graph</>;
}


export default { main: PageGraph, title: PageGraphTitle, plainTitle: async () => "Page graph" };



// NOTE: For whatever reason, below stops working when moved to a separate file:
// namely, getObjectData calls end up silently failing.
// This may have something to do with encapsulation.
/** Returns a set of React Flow elements representing Aperis site structure. */
function useReactFlowElements(): Elements | undefined | null {
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

  const hasRootElements: boolean | undefined =
    landingExists === true && topLevelStaticPageExists === true
      ? true
      : landingExists === undefined || topLevelStaticPageExists === undefined
        ? undefined
        : false;

  const [buildStatus, updateBuildStatus] =
    useState<{ basicNodesBuilt?: true }>({});

  const isReady = hasRootElements && !indexProgress;

  useEffect(() => {
    if (isReady && !buildStatus.basicNodesBuilt) {
      buildBasicNodes();
    }
  }, [hasRootElements, indexProgress]);

  useEffect(() => {
    if (itemCount > 0 && buildStatus.basicNodesBuilt) {
      buildMissingPageElements(itemCount).catch(err => log.error("Failed to build missing page nodes", err));
    }
  }, [itemCount, buildStatus.basicNodesBuilt]);

  async function getLandingNode(): Promise<Node> {
    const data = await getSingleEntryData<LandingPage>('/index.yaml');
    return landingPageToUnpositionedNode(data);
  }

  async function getPageNode(pagePath: string, idx?: number): Promise<Node> {
    const data = await getSingleEntryData<StaticPage>(pagePath);
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
    updateBuildStatus({ basicNodesBuilt: true });
  }

  async function buildMissingPageElements(itemCount: number) {
    log.debug("Building missing page nodes", itemCount);
    const stubs: number[] = [...new Array(itemCount)].map((_, idx) => idx);
    for (const position of stubs) {
      log.debug("Getting filtered object path", position);
      let entryPath: string = '';
      try {
        const resp = await getObjectPathFromFilteredIndex({ indexID: pagesIndexID, position });
        entryPath = resp.objectPath;
      } catch (e) {
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
    log.debug("Building missing page nodes: Done");
  }

  async function getSingleEntryData<T extends StaticPage | LandingPage>(
    entryPath: string,
  ): Promise<T> {
    log.debug("Getting single entry data", entryPath);
    const result = await getObjectData({ objectPaths: [entryPath] });
    log.debug("Getting single entry data", entryPath, result);
    const entryData = result.data[entryPath];
    if (entryData) {
      return entryData as T;
    } else {
      log.error("Failed to get entry data", entryPath);
      throw new Error("Failed to retrieve entry data");
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
