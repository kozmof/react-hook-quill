import { useRef } from 'react';
import { useQuill } from '../../../lib/useQuill';

export const QuillInitError = () => {
  const ref = useRef<HTMLDivElement>(null);

  useQuill({
    setting: {
      containerRef: ref,
      // Invalid options to trigger an error
      options: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        theme: 'invalid-theme-that-does-not-exist' as any
      }
    }
  });

  return (
    <div ref={ref} data-testid="error-container" />
  );
};
