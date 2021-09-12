/** @jsx jsx */
/** @jsxFrag React.Fragment */

import React from 'react';
import { css, jsx } from '@emotion/react';
import { Colors } from '@blueprintjs/core';


const MenuWrapper: React.FC<Record<never, never>> = function ({ children }) {
  return (
    <div css={css`display: flex; flex-flow: row wrap; padding: .5rem 1rem; background: ${Colors.LIGHT_GRAY3}`}>
      {children}
    </div>
  );
};

export default MenuWrapper;
