/** @jsx jsx */
/** @jsxFrag React.Fragment */

import log from 'electron-log';
import update from 'immutability-helper';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { jsx } from '@emotion/react';
import dagre from 'dagre';
import ReactFlow, { Elements, Node, Edge, isNode, Position } from 'react-flow-renderer';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { ObjectDatasetRequest, ObjectDatasetResponse } from '@riboseinc/paneron-extension-kit/types';
import useDebounce from '@riboseinc/paneron-extension-kit/useDebounce';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import { LandingPage, StaticPage } from '../types';
import useHasRootEntries from '../useHasRootEntries';
import { AperisContext } from '../context';
import { getParentPagePath } from '../util';
import { DetailWrapper } from './util';
import { SOURCE_ENTRY } from '../protocolRegistry';


function useReactFlowElements(): Elements | undefined | null {
  const { landingPage: landingExists, topLevelPage: topLevelStaticPageExists } = useHasRootEntries();

  const [ elements, updateElements ] = useState<Elements>([]);

  const {
    useFilteredIndex,
    useIndexDescription,
    //getFilteredIndexPosition,
    getObjectPathFromFilteredIndex,
    getObjectData,
    logger: log,
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
    updateElements(els => update(els, { $push: [
      landingEl,
      topLevelPageEl,
      getEdge('/index.yaml', '/pages/index.yaml'),
    ] }));
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
          updateElements(els => update(els, { $push: [
            pageEl,
            getEdge(parentPath, entryPath),
          ] }));
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
  getter: (opts: ObjectDatasetRequest) => Promise<ObjectDatasetResponse>,
): Promise<T> {
  const result = await getter({ objectPaths: [ entryPath ]});
  const entryData = result.data[entryPath];
  if (entryData) {
    return entryData as T;
  } else {
    log.error("Failed to get entry data", entryPath);
    throw new Error("Failed to retrieve entry data");
  }
}


function pageToUnpositionedNode
(pagePath: string, page: StaticPage, idx?: number):
Node<{ label: JSX.Element, idx?: number }> {
  return {
    id: pagePath,
    type: 'default',
    position: { x: 0, y: 0},
    data: {
      label: <>{page.title}</>,
      idx,
    },
  }
}

function landingPageToUnpositionedNode(page: LandingPage): Node {
  return {
    id: '/index.yaml',
    type: 'input',
    position: { x: 0, y: 0},
    data: {
      label: <>Landing page</>,
    },
  }
}


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



const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// In order to keep this example simple the node width and height are hardcoded.
// In a real world app you would use the correct width and height values of
// const nodes = useStoreState(state => state.nodes) and then node.__rf.width, node.__rf.height

const nodeWidth = 172;
const nodeHeight = 36;

function augmentWithPosition(elements: Elements, direction: 'TB' | 'LR' = 'TB', offset = 0) {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  elements.forEach((el) => {
    if (isNode(el)) {
      dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
    } else {
      dagreGraph.setEdge(el.source, el.target);
    }
  });

  dagre.layout(dagreGraph);

  return elements.map((el) => {
    if (isNode(el)) {
      const nodeWithPosition = dagreGraph.node(el.id);
      el.targetPosition = (isHorizontal ? 'left' : 'top') as Position;
      el.sourcePosition = (isHorizontal ? 'right' : 'bottom') as Position;

      // unfortunately we need this little hack to pass a slightly different position
      // to notify react flow about the change. Moreover we are shifting the dagre node position
      // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
      el.position = {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000 + offset,
        y: nodeWithPosition.y - nodeHeight / 2 + offset,
      };
    }

    return el;
  });
};
