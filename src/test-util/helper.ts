import { UserEvent } from '@testing-library/user-event'
import { waitFor } from '@testing-library/react'

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
