/** @jsx jsx */
/** @jsxFrag React.Fragment */

//import log from 'electron-log';
import React, { useContext, useEffect } from 'react';
import { jsx, css } from '@emotion/react';
import { Button, InputGroup } from '@blueprintjs/core';

import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';
import { PersistentStateReducerHook } from '@riboseinc/paneron-extension-kit/usePersistentStateReducer';
import { TabbedWorkspaceContext } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import useDebounce from '@riboseinc/paneron-extension-kit/useDebounce';
import makeSearchResultList from '@riboseinc/paneron-extension-kit/widgets/SearchResultList';

import { LandingPage, Post, StaticPage } from '../types';
import SourceEntry from '../lists/SourceEntry';
import { getSourceEntryType } from '../util';
import { SOURCE_ENTRY } from '../protocolRegistry';
import { AperisContext } from '../context';


interface State {
  quickSubstringQuery: string;
  selectedItemPath: string | null;
}
type Action =
  | { type: 'update-quick-substring-query'; payload: { substring: string; }; }
  | { type: 'select-item'; payload: { itemPath: string | null; }; }

const Search: React.FC<{ className?: string }> = function ({ className }) {
  const { usePersistentDatasetStateReducer } = useContext(DatasetContext);
  const { lastSelectedSourceEntry } = useContext(AperisContext);
  const { spawnTab, focusedTabURI } = useContext(TabbedWorkspaceContext);

  const [ state, dispatch ] = (usePersistentDatasetStateReducer as PersistentStateReducerHook<State, Action>)(
    'search-sidebar',
    undefined,
    undefined,
    (prevState, action) => {
      switch (action.type) {
        case 'update-quick-substring-query':
          return {
            ...prevState,
            quickSubstringQuery: action.payload.substring,
          };
        case 'select-item':
          return {
            ...prevState,
            selectedItemPath: action.payload.itemPath,
          };
        default:
          throw new Error("Unexpected search state");
      }
    },
    {
      quickSubstringQuery: '',
      selectedItemPath: null,
    },
    null);

  useEffect(() => {
    if (focusedTabURI) {
      const [proto, itemPath] = focusedTabURI.split(':');
      if (proto === SOURCE_ENTRY) {
        console.debug("Setting item path", itemPath);
        dispatch({ type: 'select-item', payload: { itemPath } });
      }
    }
  }, [focusedTabURI]);

  useEffect(() => {
    dispatch({ type: 'select-item', payload: { itemPath: lastSelectedSourceEntry.path } });
  }, [lastSelectedSourceEntry.path]);

  const quickSearchString = (state.quickSubstringQuery ?? '').trim().toLowerCase();

  const queryExpression = useDebounce(
    quickSearchString !== ''
      ? `JSON.stringify(obj).toLowerCase().indexOf("${quickSearchString.replace(/"/g, "\\\"")}") >= 0`
      : `true`,
    500);

  return (
    <div css={css`display: flex; flex-flow: column nowrap;`} className={className}>
      <div css={css`padding: 5px;`}>
        <InputGroup
          fill
          value={quickSearchString}
          leftIcon="search"
          placeholder="Quick text search"
          title="Search for a substring occurring anywhere within serialized item data."
          css={css`width: 200px; ${quickSearchString !== '' ? 'input { font-weight: bold; }' : ''}`}
          rightElement={<Button
            disabled={quickSearchString === ''}
            onClick={() => dispatch({ type: 'update-quick-substring-query', payload: { substring: '' } })}
            small
            minimal
            icon="cross"
            title="Clear quick search" />}
          onChange={evt => dispatch({ type: 'update-quick-substring-query', payload: { substring: evt.currentTarget.value } })}
        />
      </div>
      <div css={css`flex: 1;`}>
        <SourceEntrySearchResultList
          queryExpression={getSourceEntryQuery(queryExpression)}
          selectedItemPath={state.selectedItemPath}
          onSelectItem={itemPath => dispatch({ type: 'select-item', payload: { itemPath }})}
          onOpenItem={itemPath => spawnTab(`${SOURCE_ENTRY}:${itemPath}`)}
        />
      </div>
    </div>
  );
}

const SourceEntrySearchResultList = makeSearchResultList<StaticPage | Post | LandingPage>(SourceEntry, (path) => ({
  name: path ? getSourceEntryType(path) : 'n/a',
  iconProps: {
    icon: 'document',
  },
}));


function getSourceEntryQuery(queryExp: string): string {
  return `return objPath.endsWith("index.yaml") && ${queryExp.trim()}`;
}


export default Search;
