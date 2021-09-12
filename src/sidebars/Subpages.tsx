/** @jsx jsx */
/** @jsxFrag React.Fragment */

//import log from 'electron-log';
import React, { useContext, useEffect, useState } from 'react';
import { jsx, css } from '@emotion/react';
import { Button, InputGroup } from '@blueprintjs/core';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import makeSearchResultList from '@riboseinc/paneron-extension-kit/widgets/SearchResultList';
import { AperisContext } from '../context';
import { StaticPage } from '../types';
import { Page } from '../lists/SourceEntry';
import { SOURCE_ENTRY } from '../protocolRegistry';


const Subpages: React.VoidFunctionComponent<Record<never, never>> =
function () {
  const { spawnTab } = useContext(TabbedWorkspaceContext);
  const { operations, lastSelectedSourceEntry: { type: parentType, path: parentPath } } = useContext(AperisContext);
  const [selectedSubpagePath, selectSubpagePath] = useState<string | null>(null);

  const [newSubpageID, setNewSubpageID] = useState('');

  useEffect(() => {
    setNewSubpageID('');
  }, [parentPath]);

  if (parentType !== 'page') {
    return <>N/A</>;
  }

  const pathComponentCount = parentPath.split('/').length;
  const childPathComponentCount = pathComponentCount + 1;
  const childrenQueryExpression = `return objPath.startsWith('${parentPath.replace('index.yaml', '')}') && objPath.endsWith('index.yaml') && objPath.split('/').length === ${childPathComponentCount}`;

  async function handleAddSubpage() {
    if (operations && newSubpageID.trim() !== '') {
      await operations.pages.create(
        `${parentPath.replace('/index.yaml', '')}/${newSubpageID.trim()}/index.yaml`,
        { title: "New page" },
      );
      setNewSubpageID('');
    }
  }

  const canAddSubpage = operations && newSubpageID.trim() !== '';

  return (
    <div css={css`display: flex; flex-flow: column nowrap;`}>
      <div css={css`height: 20vh;`}>
        <SearchResultList
          queryExpression={childrenQueryExpression}
          selectedItemPath={selectedSubpagePath}
          onSelectItem={selectSubpagePath}
          onOpenItem={itemPath => spawnTab(`${SOURCE_ENTRY}:${itemPath}`)}
        />
      </div>
      <div css={css`margin-top: 5px;`}>
        <InputGroup
          fill
          value={newSubpageID}
          placeholder="New subpage ID…"
          disabled={!operations}
          onChange={evt => setNewSubpageID(evt.currentTarget.value)}
          rightElement={
            <Button
              minimal
              onClick={handleAddSubpage}
              title="Create new subpage"
              intent={canAddSubpage ? 'primary' : undefined}
              disabled={!canAddSubpage}
              icon="tick-circle"
            />
          }
        />
      </div>
    </div>
  );
};

export default Subpages;


const SearchResultList = makeSearchResultList<StaticPage>(Page, () => ({
  name: 'page',
  iconProps: {
    icon: 'document',
  },
}));

// const PageURLMenu: React.FC<{
//   onAddSubpage?: (newID: string) => Promise<void>
//   onChangeURL?: (withRedirect: boolean) => Promise<void>
//   onAddRedirect?: () => void
//   onDelete?: () => Promise<void>
// }> = function ({ onChangeURL, onAddRedirect, onAddSubpage, onDelete }) {
//   const [subpageDialogIsOpen, openSubpageDialog] = useState(false);
//   const [subpageID, setSubpageID] = useState('new-page');
//   const canCreateSubpage = onAddSubpage && subpageID.trim() !== '';
//   async function handleAddSubpage() {
//     if (!canCreateSubpage || !onAddSubpage) {
//       return;
//     }
//     await onAddSubpage(subpageID);
//     setSubpageID('new-page');
//     openSubpageDialog(false);
//   }
//   return <>
//     <Menu>
//       <MenuItem icon="document" disabled={!onAddSubpage} onClick={() => openSubpageDialog(true)} text="Add subpage" />
//       <MenuItem icon="data-lineage" disabled={!onAddRedirect} onClick={onAddRedirect} text="Redirect another path to this page" />
//       <MenuItem icon="flows" disabled={!onChangeURL} onClick={() => onChangeURL!(true)} text="Change URL and leave redirect" />
//       <MenuDivider title="Advanced" />
//       <MenuItem icon="edit" intent="danger" disabled={!onChangeURL} onClick={() => onChangeURL!(false)} text="Change URL without redirect" />
//       <MenuItem icon="trash" intent="danger" disabled={!onDelete} onClick={onDelete} text="Delete this page without redirect" />
//     </Menu>
//     <Dialog isOpen={subpageDialogIsOpen} title="Add subpage">
//       <FormGroup
//           label="New page ID"
//           intent={subpageID === '' ? 'danger' : undefined}
//           helperText="Should contain English characters only, no punctuation or spaces. Used as the last part of subpage URL.">
//         <InputGroup
//           value={subpageID}
//           onChange={evt => setSubpageID(evt.currentTarget.value)}
//         />
//       </FormGroup>
//       <Button
//           intent={canCreateSubpage ? 'primary' : undefined}
//           disabled={!canCreateSubpage}
//           onClick={handleAddSubpage}>
//         Add subpage
//       </Button>
//     </Dialog>
//   </>
// };
