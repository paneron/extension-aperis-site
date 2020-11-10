import awsGHA from './awsGHA';
import { DeploymentSetup } from './types';

// NOTE: Don’t modify any existing setup in a way that changes files it affects.
// Generally, this is append-only;
// add version marker in title and and setup ID if a new variation of setup is added;
// deprecation can be implemented later if necessary.
const deploymentSetup: { [setupID: string]: DeploymentSetup } = {
  awsGHA,
};

export default deploymentSetup;
