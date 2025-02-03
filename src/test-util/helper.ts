import { UserEvent } from '@testing-library/user-event'
import { waitFor } from '@testing-library/react'
import { PointerInput } from '@testing-library/user-event/dist/cjs/pointer/index.js';

export const editQuillRTLHelper = async (user: UserEvent, userAction: () => Promise<void>) => {
  const container = await waitFor(() => document.getElementsByClassName('ql-editor'))
  for (let i = 0; i < container.length; i++) {
    const element = container.item(i);
    if (element) {
      await user.click(element);
      await userAction();
    }
  }
}

export const selectQuillRTLHelper = async (user: UserEvent, startOffset: number = 0, pointerInput: Extract<PointerInput, PointerInput[]>= []) => {
  const container = await waitFor(() => document.getElementsByClassName('ql-editor'))
  for (let i = 0; i < container.length; i++) {
    const element = container.item(i);
    if (element) {
      await user.pointer([
        { target: element, offset: startOffset, keys: '[MouseLeft>]' },
        ...pointerInput,
        { keys: '[/MouseLeft]' }
      ]);
    }
  }
}
