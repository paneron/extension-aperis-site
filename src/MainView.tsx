/** @jsx jsx */
/** @jsxFrag React.Fragment */

import update, { Spec } from 'immutability-helper';
import log from 'electron-log';
import { useContext, useEffect, useState } from 'react';
import { css, jsx } from '@emotion/react';

import TabbedWorkspace from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace';
import { makeContextProvider as makeTabbedWorkspaceContextProvider } from '@riboseinc/paneron-extension-kit/widgets/TabbedWorkspace/context';
import { DatasetContext } from '@riboseinc/paneron-extension-kit/context';

import { sidebarConfig, SidebarID, sidebarIDs } from './sidebars';
import protocolRegistry, { Protocol, SITE_SETTINGS, SOURCE_ENTRY } from './protocolRegistry';
import { AperisContext } from './context';
import type { AperisContext as AperisContextSpec } from './context';
import useSiteSettings from './site-settings/useSiteSettings';
import { LandingPage, Post, SourceEntryType, StaticPage } from './types';
import { getSourceEntryType, validateEntryPath } from './util';
import NewTabMenu from './NewTabMenu';


Object.assign(console, log);

const TabbedWorkspaceContextProvider = makeTabbedWorkspaceContextProvider<Protocol, SidebarID>(
  'Search',
  sidebarIDs,
  protocolRegistry);


export default function () {
  const [lastSelectedSourceEntryPath, selectSourceEntryPath] = useState('/index.yaml');

  const [previewedMediaPath, previewMediaPath] = useState<string | undefined>(undefined);
  useEffect(() => {
    previewMediaPath(undefined);
  }, [lastSelectedSourceEntryPath]);

  const settings = useSiteSettings();
  const { updateObjects, performOperation } = useContext(DatasetContext);

  async function updateEntry<T>(entryType: SourceEntryType, entryPath: string, details: string, oldData: T, updateSpec: Spec<T, never>) {
    return await performOperation(`updating ${entryType} (${details})`, async () => {
      validateEntryPath(entryType, entryPath);
      if (!updateObjects) {
        throw new Error("Read-only dataset");
      }
      await updateObjects({
        commitMessage: `Update ${entryType} (${details})`,
        objectChangeset: {
          [entryPath]: {
            oldValue: oldData,
            newValue: update(oldData, updateSpec),
          },
        },
      })
    })();
  }

  async function replaceEntry<T>(entryType: SourceEntryType, entryPath: string, details: string, oldData: T, newData: T) {
    return await performOperation(`updating ${entryType} (${details})`, async () => {
      validateEntryPath(entryType, entryPath);
      if (!updateObjects) {
        throw new Error("Read-only dataset");
      }
      await updateObjects({
        commitMessage: `Update ${entryType} (${details})`,
        objectChangeset: {
          [entryPath]: {
            oldValue: oldData,
            newValue: newData,
          },
        },
      })
    })();
  }

  async function createEntry<T>(entryType: SourceEntryType, entryPath: string, entryData: T) {
    return await performOperation(`creating ${entryType}`, async () => {
      validateEntryPath(entryType, entryPath);
      if (!updateObjects) {
        throw new Error("Read-only dataset");
      }
      await updateObjects({
        commitMessage: `Create ${entryType}`,
        objectChangeset: {
          [entryPath]: {
            oldValue: null,
            newValue: entryData,
          },
        },
      })
    })();
  }

  async function deleteEntry(entryType: SourceEntryType, entryPath: string) {
    return await performOperation(`deleting ${entryType}`, async () => {
      validateEntryPath(entryType, entryPath);
      if (!updateObjects) {
        throw new Error("Read-only dataset");
      }
      await updateObjects({
        commitMessage: `Delete ${entryType}`,
        objectChangeset: {
          [entryPath]: {
            oldValue: undefined,
            newValue: null,
          },
        },
        _dangerouslySkipValidation: true,
      })
    })();
  }

  function handleFocusedTabChange(newURI: string | undefined) {
    const isSourceEntry = newURI && newURI.startsWith(`${SOURCE_ENTRY}:`);
    if (isSourceEntry) {
      selectSourceEntryPath(newURI.split(':')[1] ?? '/index.yaml');
    }
    const isSiteSettings = newURI && newURI.startsWith(`${SITE_SETTINGS}:`);
    if (isSiteSettings) {
      selectSourceEntryPath('/index.yaml');
    }
  }

  const lastSelectedSourceEntry = {
    path: lastSelectedSourceEntryPath,
    type: getSourceEntryType(lastSelectedSourceEntryPath),
  };

  const ctx: AperisContextSpec = {
    lastSelectedSourceEntry,
    siteSettings: settings.value,
    selectSourceEntry: selectSourceEntryPath,
    previewedMediaPath,
    previewMediaPath,
    operations: updateObjects
      ? {
          pages: {
            create: (path, data) => createEntry<StaticPage>(
              'page', path, data,
            ),
            replace: (path, details, oldData, newData) => replaceEntry<StaticPage>(
              'page', path, details, oldData, newData,
            ),
            update: (path, details, oldData, spec) => updateEntry<StaticPage>(
              'page', path, details, oldData, spec,
            ),
            delete: (path) => deleteEntry(
              'page', path,
            ),
          },
          posts: {
            create: (path, data) => createEntry<StaticPage>(
              'post', path, data,
            ),
            replace: (path, details, oldData, newData) => replaceEntry<Post>(
              'post', path, details, oldData, newData,
            ),
            update: (path, details, oldData, spec) => updateEntry<Post>(
              'post', path, details, oldData, spec,
            ),
            delete: (path) => deleteEntry(
              'post', path,
            ),
          },
          landingPage: {
            create: (_, data) => createEntry<LandingPage>(
              'landing', '/index.yaml', data,
            ),
            replace: (_, details, oldData, newData) => replaceEntry<LandingPage>(
              'landing', '/index.yaml', details, oldData, newData,
            ),
            update: (_, details, oldData, spec) => updateEntry<LandingPage>(
              'landing', '/index.yaml', details, oldData, spec,
            ),
            delete: () => { throw new Error("Landing page deletion is not supported"); },
          },
        }
      : undefined,
  };

  //let effectiveSidebarIDs: SidebarID[] = [];
  //if (lastSelectedSourceEntry.type !== 'page') {
  //  effectiveSidebarIDs = sidebarIDs.filter(sid => sid !== 'Structure');
  //} else {
  //  effectiveSidebarIDs = sidebarIDs;
  //}

  return (
    <AperisContext.Provider value={ctx}>
      <TabbedWorkspaceContextProvider
          stateKey="aperis-view"
          onFocusedTabChange={handleFocusedTabChange}>
        <TabbedWorkspace
          css={css`flex: 1 1 auto;`}
          sidebarConfig={sidebarConfig}
          sidebarIDs={sidebarIDs}
          newTabPrompt={<NewTabMenu />}
        />
      </TabbedWorkspaceContextProvider>
    </AperisContext.Provider>
  );
};

// const DocPageActions: React.FC<{
//   syncStatus?: FileChangeType
// }> =
// function ({ syncStatus }) {
// 
//   return (
//     <ButtonGroup minimal>
//       <Icon
//         title={syncStatus !== 'unchanged' && syncStatus !== undefined
//           ? `This page has been ${syncStatus} since last synchronization`
//           : undefined}
//         icon={syncStatus === 'unchanged' ? 'tick-circle' : 'asterisk'}
//       />
//     </ButtonGroup>
//   );
// };


// const DocPageNavLabel: React.FC<{
//   pos: number,
//   indexID: string,
//   onSelect: (objectPath: string) => void,
// }> = function ({ pos, indexID, onSelect }) {
//   const { useObjectPathFromFilteredIndex, useObjectData } = useContext(DatasetContext);
//   const { value: { objectPath } } = useObjectPathFromFilteredIndex({ position: pos, indexID });
//   const data = (useObjectData({ objectPaths: [objectPath] }).value.data[objectPath] ?? null) as SourceDocPageData | null;
//   return <>
//     {data?.title ?? `Page at ${objectPath}`}
//   </>;
// }
