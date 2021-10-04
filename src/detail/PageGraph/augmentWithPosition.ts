import dagre from 'dagre';
import { Elements, isNode, Position } from 'react-flow-renderer';


/** Given a set of elements, augments them with position, performing auto-layout. */
export default function augmentWithPosition(
  elements: Elements,
  direction: 'TB' | 'LR' = 'TB',
  offset = 0,
) {
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
}

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// In order to keep this example simple the node width and height are hardcoded.
// In a real world app you would use the correct width and height values of
// const nodes = useStoreState(state => state.nodes) and then node.__rf.width, node.__rf.height
const nodeWidth = 172;
const nodeHeight = 36;
