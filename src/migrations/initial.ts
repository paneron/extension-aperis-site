import type { MigrationInfo } from '@riboseinc/paneron-extension-kit/types/migrations';


const initialMigration: MigrationInfo = {
  versionAfter: '1.0.0',
  migrator: async function * initialMigration () {
    yield {};
  },
};

export default initialMigration;
