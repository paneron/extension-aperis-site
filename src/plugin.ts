import { makeExtension } from '@riboseinc/paneron-extension-kit';
import MainView from './MainView';
import datasetInitializer from './migrations/initial';

export default makeExtension({
  mainView: MainView,
  name: "Aperis site",
  requiredHostAppVersion: "^2.0.0",
  datasetMigrations: {},
  datasetInitializer,
});
