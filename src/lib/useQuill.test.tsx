import Quill from 'quill';
import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { editQuillRTLHelper, selectQuillRTLHelper } from '../test-util/helper';
import { user } from '../../vitest.setup';

// Components for the tests
import { NonStateControl } from '../test-util/components/test-baseline/NonStateControl';
import { Cleanup } from '../test-util/components/test-baseline/Cleanup';
import { NotCleanup } from '../test-util/components/test-baseline/NotCleanup';
import { CallAPIOnSetup } from '../test-util/components/test-api/CallAPIOnSetup';
import { CallAPIOnCleanup } from '../test-util/components/test-api/CallAPIOnCleanup';
import { CallAPIInside } from '../test-util/components/test-api/CallAPIInside';
import { CallAPIOutside } from '../test-util/components/test-api/CallAPIOutside';
import { StateControl } from '../test-util/components/test-state-control/StateControl';
import { UseSyncDelta1, UseSyncDelta2 } from '../test-util/components/test-use-sync-delta/UseSyncDelta';
import { UpdateOptionsSD } from '../test-util/components/test-use-sync-delta/UpdateOptions';
import { RegisterModule1 } from '../test-util/components/test-register-module/RegisterModule1';
import { RegisterModule2 } from '../test-util/components/test-register-module/RegisterModule2';
import { Counter } from '../test-util/components/test-register-module/counter';
import { UpdateSetupSD } from '../test-util/components/test-use-sync-delta/UpdateSetup';
import { UpdateCleanupSD } from '../test-util/components/test-use-sync-delta/UpdateCleanup';
import { RegisterBlot } from '../test-util/components/test-register-blot/RegisterBlot';
import { DividerBlot } from '../test-util/components/test-register-blot/dividerBlot';
import { OnSelection } from '../test-util/components/test-api/OnSelection';
import { RegisterToolbar } from '../test-util/components/test-register-module/RegisterToolbar';
import { UpdateCleanupPD } from '../test-util/components/test-use-persistent-delta/UpdateCleanup';
import { UpdateSetupPD } from '../test-util/components/test-use-persistent-delta/UpdateSetup';
import { UpdateOptionsPD } from '../test-util/components/test-use-persistent-delta/UpdateOptions';
import { UsePersitentDelta } from '../test-util/components/test-use-persistent-delta/UsePersistentDelta';

const enterAction = '[Enter]';

Quill.register('modules/counter', Counter);
Quill.register(DividerBlot);

// ----------------------------------------------------------------------------------------------------------

describe('The case where React doesn\'t have the state of edits on Quill', () => {
  it('tests basic inputs', async () => {
    // This component doesn't track the state of Quill in the React side.
    // All edits in Quill are handled outside of the React lifecycle.
    render(<NonStateControl />);

    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT1');
      await user.keyboard(enterAction);
      await user.keyboard('TEST INPUT2');
      await user.keyboard(enterAction);
      await user.paste('TEST PASTE');
    });

    expect(await screen.findByText('TEST INPUT1')).toBeVisible();
    expect(await screen.findByText('TEST INPUT2')).toBeVisible();
    expect(await screen.findByText('TEST PASTE')).toBeVisible();
  });

  it('calls a cleanup function for Quill when the parent component is re-rendered, and all edits are cleaned up', async () => {
    render(<Cleanup />);

    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT');
    });

    // Ensure that the user's edits are applied.
    expect(await screen.findByText('TEST INPUT')).toBeVisible();

    // Change the state of the parent component of Quill to trigger a re-render cycle.
    // In this case, the Quill editor component is not memoized, so it calls a cleanup function.
    const button = screen.getByText('cleanup');
    await user.click(button);

    // User edits are cleaned up
    expect(screen.queryByText('TEST INPUT')).toBeNull();
  });

  it('keeps all edits, even if the parent component is re-rendered', async () => {
    render(<NotCleanup />);

    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT');
    });

    // Change the state of the parent component of Quill to trigger a re-render cycle.
    // In this case, the Quill editor component retains the user's edits.
    const button = screen.getByText('cleanup');
    await user.click(button);

    // User edits are not cleaned up
    expect(await screen.findByText('TEST INPUT')).toBeVisible();
  });
});

// ----------------------------------------------------------------------------------------------------------

describe('The case for calling the Quill API during setup', () => {
  it('sets the contents via the API during setup', async () => {
    // This component sets up the default text.
    render(<CallAPIOnSetup />);

    expect(await screen.findByText('Hello Quill')).toBeVisible();
  });
});

// ----------------------------------------------------------------------------------------------------------

describe('The case for calling the Quill API during cleanup', () => {
  it('sets the contents to clipboard via the API during cleanup', async () => {
    // This component copies text to the clipboard when the Quill editor component is unmounted.
    const { unmount } = render(<CallAPIOnCleanup />);

    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT');
    });

    // Unmount to call a cleanup function.
    unmount();
    expect(await navigator.clipboard.readText()).to.equal('TEST INPUT\n\n');
  });
});

// ----------------------------------------------------------------------------------------------------------

describe('The case for accessing the Quill API inside the editor component', () => {
  it('tests calling the Quill API and modifying edits.', async () => {
    // This component adds 'INSERT' to the text when the user clicks a button.
    render(<CallAPIInside />);

    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT');
    });

    // Add 'INSERT' to the text by clicking the button.
    const button = screen.getByRole('button', { name: 'Insert' });
    await user.click(button);

    expect(await screen.findByText('TEST INPUT')).toBeVisible();
    expect(await screen.findByText('INSERT')).toBeVisible();
  });
});

// ----------------------------------------------------------------------------------------------------------

describe('The case for accessing the Quill API outside the editor component', () => {
  it('tests calling the Quill API outside the editor component', async () => {
    // This component adds 'INSERT FROM OUTSIDE' to the text when the user clicks the button, which is placed outside the editor component.
    render(<CallAPIOutside />);

    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT');
    });

    // Add 'INSERT FROM OUTSIDE' to the text by clicking the button.
    const button = screen.getByRole('button', { name: 'Insert' });
    await user.click(button);

    expect(await screen.findByText('TEST INPUT')).toBeVisible();
    expect(await screen.findByText('INSERT FROM OUTSIDE')).toBeVisible();
  });
});

// ----------------------------------------------------------------------------------------------------------

describe('The case where React syncs the state of edits with Quill', () => {
  it('manages the state', async () => {
    render(<StateControl />);

    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT1');
      await user.keyboard(enterAction);
      await user.keyboard('TEST INPUT2');
      await user.keyboard(enterAction);
      await user.paste('TEST PASTE');
    });

    expect(await screen.findByText('TEST INPUT1')).toBeVisible();
    expect(await screen.findByText('TEST INPUT2')).toBeVisible();
    expect(await screen.findByText('TEST PASTE')).toBeVisible();
    expect(await screen.findByText('Hello Quill')).toBeVisible();

    await user.click(screen.getByLabelText('Edit'));
    await user.keyboard('TEST INPUT3');

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('TEST INPUT1')).toBeVisible();
    expect(await screen.findByText('TEST INPUT2')).toBeVisible();
    expect(await screen.findByText('TEST PASTE')).toBeVisible();
    expect(await screen.findByText('Hello Quill')).toBeVisible();
    expect(await screen.findByText('TEST INPUT3')).toBeVisible();

    // This component exposes the state for testing.
    expect(await screen.findByText(
      JSON.stringify(
        { ops: [{ insert: 'TEST INPUT1\nTEST INPUT2\nTEST PASTE\nHello Quill\nTEST INPUT3\n' }] }
      )
    )).toBeVisible();
  });
});

// ----------------------------------------------------------------------------------------------------------

describe('The case for adding Quill modules', () => {
  it('tests adding a module', async () => {
    render(<RegisterModule1 />);
    expect(await screen.findByText('2 words')).toBeVisible();
    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT1');
      await user.keyboard(enterAction);
      await user.keyboard('TEST INPUT2');
      await user.keyboard(enterAction);
      await user.paste('TEST PASTE');
    });
    expect(await screen.findByText('8 words')).toBeVisible();

    expect(await screen.findByText('TEST INPUT1')).toBeVisible();
    expect(await screen.findByText('TEST INPUT2')).toBeVisible();
    expect(await screen.findByText('TEST PASTE')).toBeVisible();
    expect(await screen.findByText('Hello Quill')).toBeVisible();

  });
});

// ----------------------------------------------------------------------------------------------------------

describe('The case for adding Quill modules with useSyncDelta', () => {
  it('tests adding a module', async () => {
    render(<RegisterModule2 />);
    expect(await screen.findByText('2 words')).toBeVisible();
    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT1');
      await user.keyboard(enterAction);
      await user.keyboard('TEST INPUT2');
      await user.keyboard(enterAction);
      await user.paste('TEST PASTE');
    });
    expect(await screen.findByText('8 words')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Count Characters' }));
    expect(await screen.findByText('47 characters')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Count Words' }));
    expect(await screen.findByText('8 words')).toBeVisible();

    expect(await screen.findByText('TEST INPUT1')).toBeVisible();
    expect(await screen.findByText('TEST INPUT2')).toBeVisible();
    expect(await screen.findByText('TEST PASTE')).toBeVisible();
    expect(await screen.findByText('Hello Quill')).toBeVisible();
  });
});

// ----------------------------------------------------------------------------------------------------------

describe('The case for adding a Quill Blot', () => {
  it('tests adding a blot', async () => {
    render(<RegisterBlot />);
    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT1');
      await user.keyboard(enterAction);
      await user.keyboard('TEST INPUT2');
      await user.keyboard(enterAction);
      await user.paste('TEST PASTE');
    });
    expect(screen.queryByRole('separator')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Add Divider' }));
    expect(await screen.findByRole('separator')).toBeVisible();

    expect(await screen.findByText('TEST INPUT1')).toBeVisible();
    expect(await screen.findByText('TEST INPUT2')).toBeVisible();
    expect(await screen.findByText('TEST PASTE')).toBeVisible();
    expect(await screen.findByText('Hello Quill')).toBeVisible();
  });
});

// ----------------------------------------------------------------------------------------------------------

describe('The case for using useQuill with useSyncDelta', () => {
  it('syncs the internal Quill state and the state using useSyncDelta', async () => {
    render(<UseSyncDelta1 />);

    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT1');
      await user.keyboard(enterAction);
      await user.keyboard('TEST INPUT2');
      await user.keyboard(enterAction);
      await user.paste('TEST PASTE');
    });

    expect(await screen.findByText('TEST INPUT1')).toBeVisible();
    expect(await screen.findByText('TEST INPUT2')).toBeVisible();
    expect(await screen.findByText('TEST PASTE')).toBeVisible();

    await user.click(screen.getByLabelText('Edit'));
    await user.keyboard('TEST INPUT3');

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('TEST INPUT1')).toBeVisible();
    expect(await screen.findByText('TEST INPUT2')).toBeVisible();
    expect(await screen.findByText('TEST PASTE')).toBeVisible();
    expect(await screen.findByText('TEST INPUT3')).toBeVisible();

    expect(await screen.findByText(
      JSON.stringify(
        { ops: [{ insert: 'TEST INPUT1\nTEST INPUT2\nTEST PASTE\n\nTEST INPUT3\n' }] }
      )
    )).toBeVisible();

  });

  it('syncs the internal Quill state with the state using useSyncDelta', async () => {
    render(<UseSyncDelta2 />);

    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT1');
      await user.keyboard(enterAction);
      await user.keyboard('TEST INPUT2');
      await user.keyboard(enterAction);
      await user.paste('TEST PASTE');
    });

    expect(await screen.findByText('TEST INPUT1')).toBeVisible();
    expect(await screen.findByText('TEST INPUT2')).toBeVisible();
    expect(await screen.findByText('TEST PASTE')).toBeVisible();
    expect(await screen.findByText('Hello Quill')).toBeVisible();

    await user.click(screen.getByLabelText('Edit'));
    await user.keyboard('TEST INPUT3');

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('TEST INPUT1')).toBeVisible();
    expect(await screen.findByText('TEST INPUT2')).toBeVisible();
    expect(await screen.findByText('TEST PASTE')).toBeVisible();
    expect(await screen.findByText('Hello Quill')).toBeVisible();
    expect(await screen.findByText('TEST INPUT3')).toBeVisible();

    expect(await screen.findByText(
      JSON.stringify(
        { ops: [{ insert: 'TEST INPUT1\nTEST INPUT2\nTEST PASTE\nHello Quill\nTEST INPUT3\n' }] }
      )
    )).toBeVisible();

  });

  it('changes the settings correctly while the edits state remains the same', async () => {
    render(<UpdateOptionsSD />);

    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT1');
      await user.keyboard(enterAction);
      await user.keyboard('TEST INPUT2');
      await user.keyboard(enterAction);
      await user.paste('TEST PASTE');
    });

    /**
     * This is a bit of a tricky test.
     * 
     * Both the snow and bubble themes have a toolbar in DOM.
     * When the theme is snow, ensure the toolbar is **not** in `ql-hidden` (toBeNull).
     * When the theme is bubble, ensure the toolbar is in `ql-hidden` (toBeInTheDocument).
     */

    // Switch to the snow theme
    await user.click(screen.getByRole('button', { name: 'snow' }));
    const qlHidden1 = (await waitFor(() => document.getElementsByClassName('ql-hidden'))).item(0);
    if (qlHidden1 instanceof HTMLElement) {
      expect(within(qlHidden1).queryByRole('toolbar')).toBeNull();
    } else {
      throw new Error();
    }
    expect(await screen.findByRole('toolbar')).toBeInTheDocument();

    // Switch to the bubble theme
    await user.click(screen.getByRole('button', { name: 'bubble' }));
    const qlHidden2 = (await waitFor(() => document.getElementsByClassName('ql-hidden'))).item(0);
    if (qlHidden2 instanceof HTMLElement) {
      expect(await within(qlHidden2).findByRole('toolbar')).toBeInTheDocument();
    } else {
      throw new Error();
    }
    expect(await screen.findByRole('toolbar')).toBeInTheDocument();

    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT3');
    });

    expect(await screen.findByText('TEST INPUT1')).toBeVisible();
    expect(await screen.findByText('TEST INPUT2')).toBeVisible();
    expect(await screen.findByText('TEST INPUT3')).toBeVisible();
    expect(await screen.findByText('TEST PASTE')).toBeVisible();
    expect(await screen.findByText('Hello Quill')).toBeVisible();
  });

  it('tests updating a setup function', async () => {
    render(<UpdateSetupSD />);
    await user.click(screen.getByRole('button', { name: 'Update Setup' }));
    expect(await screen.findByText('101')).toBeVisible();
  });

  it('tests updating a cleanup function', async () => {
    render(<UpdateCleanupSD />);
    await user.click(screen.getByRole('button', { name: 'Update Cleanup' }));
    await user.click(screen.getByRole('button', { name: 'Update Cleanup' }));
    expect(await screen.findByText('101')).toBeVisible();
  });
});

// ----------------------------------------------------------------------------------------------------------

describe('The case for using useQuill with usePersitentDelta', () => {
  it('keeps all edits, even if the parent component is re-rendered', async () => {
    render(<UsePersitentDelta />);

    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT');
    });

    // Change the state of the parent component of Quill to trigger a re-render cycle.
    // In this case, the Quill editor component retains the user's edits.
    const button = screen.getByText('cleanup');
    await user.click(button);

    // User edits are not cleaned up
    expect(await screen.findByText('TEST INPUT')).toBeVisible();
  });

  it('changes the settings correctly while the edits state remains the same', async () => {
    render(<UpdateOptionsPD />);

    // User edits
    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT1');
      await user.keyboard(enterAction);
      await user.keyboard('TEST INPUT2');
      await user.keyboard(enterAction);
      await user.paste('TEST PASTE');
    });

    /**
     * This is a bit of a tricky test.
     * 
     * Both the snow and bubble themes have a toolbar in DOM.
     * When the theme is snow, ensure the toolbar is **not** in `ql-hidden` (toBeNull).
     * When the theme is bubble, ensure the toolbar is in `ql-hidden` (toBeInTheDocument).
     */

    // Switch to the snow theme
    await user.click(screen.getByRole('button', { name: 'snow' }));
    const qlHidden1 = (await waitFor(() => document.getElementsByClassName('ql-hidden'))).item(0);
    if (qlHidden1 instanceof HTMLElement) {
      expect(within(qlHidden1).queryByRole('toolbar')).toBeNull();
    } else {
      throw new Error();
    }
    expect(await screen.findByRole('toolbar')).toBeInTheDocument();

    // Switch to the bubble theme
    await user.click(screen.getByRole('button', { name: 'bubble' }));
    const qlHidden2 = (await waitFor(() => document.getElementsByClassName('ql-hidden'))).item(0);
    if (qlHidden2 instanceof HTMLElement) {
      expect(await within(qlHidden2).findByRole('toolbar')).toBeInTheDocument();
    } else {
      throw new Error();
    }
    expect(await screen.findByRole('toolbar')).toBeInTheDocument();

    await editQuillRTLHelper(user, async () => {
      await user.keyboard('TEST INPUT3');
    });

    expect(await screen.findByText('TEST INPUT1')).toBeVisible();
    expect(await screen.findByText('TEST INPUT2')).toBeVisible();
    expect(await screen.findByText('TEST INPUT3')).toBeVisible();
    expect(await screen.findByText('TEST PASTE')).toBeVisible();
    expect(await screen.findByText('Hello Quill')).toBeVisible();
  });

  it('tests updating a setup function', async () => {
    render(<UpdateSetupPD />);
    await user.click(screen.getByRole('button', { name: 'Update Setup' }));
    expect(await screen.findByText('101')).toBeVisible();
  });

  it('tests updating a cleanup function', async () => {
    render(<UpdateCleanupPD />);
    await user.click(screen.getByRole('button', { name: 'Update Cleanup' }));
    await user.click(screen.getByRole('button', { name: 'Update Cleanup' }));
    expect(await screen.findByText('101')).toBeVisible();
  });
});

// ----------------------------------------------------------------------------------------------------------

describe('The case for setting a selection change handler', () => {
  it('selects some characters', async () => {
    render(<OnSelection />);
    await selectQuillRTLHelper(user, 6, [{ offset: 8 }]);
    expect(await screen.findByText('Qu')).toBeVisible();

    await selectQuillRTLHelper(user);
    expect(screen.queryByText('Qu')).toBeNull();
  });
});

// ----------------------------------------------------------------------------------------------------------

describe('The case for setting a custom toolbar', () => {
  it('sets a custom toolbar', async () => {
    render(<RegisterToolbar />);
    expect(await screen.findByLabelText('strike')).toBeVisible();
  });
});
