/** @jsx jsx */
/** @jsxFrag React.Fragment */

import { jsx } from '@emotion/react';
import React from 'react';
import { Callout, H4, UL } from '@blueprintjs/core';


export default function () {
  return <>
    <p>
      Text editors in Aperis allow to format content using semantic controls.
      Main controls are displayed in the toolbar above the text field,
      and other controls may be displayed in mini pop-ups when certain elements are selected.
    </p>

    <H4>Schemas</H4>

    <p>
      Unlike text processors such as MS Word, anywhere you write text in Aperis, <em>schemas</em> are
      used to define constraints on the shape of content authored.
      The reasons for those constraints are such as:
    </p>
    <UL>
      <li>so that the structure makes sense (e.g., a section can’t have its header anywhere except the beginning);</li>
      <li>to aid in readability &amp; navigation (e.g., a figure must have a caption; a section must provide an ID for in-page anchor navigation);</li>
      <li>
        to make sure content can be successfully rendered into final deliverable form
        (e.g., styling assumes that page summary can be rendered inline; and if we haven’t yet figured how to style lists within figure captions, then we won’t allow lists within figure captions).
      </li>
    </UL>

    <H4>Editor instances</H4>

    <p>
      Different pieces of content use different semantic schemas,
      and editor instances are configured to only show controls
      supported by the schema of the content you’re editing.
    </p>

    <p>
      For example, the editor for the summary of a static page has very few buttons (schema does not allow subsections, etc.),
      while the editor for page <em>contents</em> has a much busier toolbar (allowing recursive subsections and more).
    </p>

    <H4>Conforming to the schema</H4>

    <p>
      Editors may use different ways of conforming your content to current content schema
      during authoring process.
    </p>
    <p>
      For example, when you want to insert a block but the editor
      thinks that based on the schema this block can’t be inserted in this context,
      the following may happen.
    </p>
    <UL>
      <li>
        You may see that the corresponding button is disabled,
        until you place the cursor elsewhere in the document where the block is allowed by the schema.
      </li>
      <li>
        The editor will allow you to insert that block,
        but in the process of doing so it will split the block your cursor is currently in.
      </li>
      <li>
        The editor will allow you to insert that block,
        but will place it <em>after</em> the block your cursor is in.
      </li>
    </UL>

    <p>
      This may take some getting used to.
      Still, we believe the end result—semantically structured documents—is worth it,
      so we’re trying to make editing process as intuitive as possible without giving up schema conformance.
    </p>

    <Callout title="Technical details">
      <p>
        First version of Aperis was developed with AsciiDoc format as source.
        However, we’ve quickly realised that AsciiDoc isn’t sufficient as
        an authoritative storage for semantic data.
        Now, Aperis uses a ProseMirror-compatible hierarchical structure of content blocks,
        and we’re switching the rendering components to ProseMirror as well.
      </p>
    </Callout>
  </>
}
