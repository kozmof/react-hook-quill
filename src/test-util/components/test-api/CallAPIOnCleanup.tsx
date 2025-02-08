import { useRef } from 'react';
import { useQuill } from '../../../lib/useQuill';

export const CallAPIOnCleanup = () => {
  const ref = useRef<HTMLDivElement>(null);
  useQuill({
    setting: {
      containerRef: ref,
      cleanup: async (quill) => {
        await navigator.clipboard.writeText(quill.getText());
      }
    }
  });

  return (
    <div ref={ref} />
  );
};
