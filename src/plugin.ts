import { makeExtension } from '@riboseinc/paneron-extension-kit';

export default makeExtension({
  mainView: () => import('./MainView'),
  name: "Aperis site",
  requiredHostAppVersion: "^1.0.0-beta1",
  datasetMigrations: {},
  datasetInitializer: () => import('./migrations/initial'),
});
