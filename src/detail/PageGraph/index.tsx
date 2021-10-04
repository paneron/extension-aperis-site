/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React, { useContext, useMemo } from 'react';
import { jsx } from '@emotion/react';
import ReactFlow, { Node, Edge } from 'react-flow-renderer';
import { NonIdealState, Spinner } from '@blueprintjs/core';
import useDebounce from '@riboseinc/paneron-extension-kit/useDebounce';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import { AperisContext } from '../../context';
import { DetailWrapper } from '../util';
import { SOURCE_ENTRY } from '../../protocolRegistry';
import useReactFlowElements from './useReactFlowElements';
import augmentWithPosition from './augmentWithPosition';


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
