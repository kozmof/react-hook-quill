import { useRef } from 'react';
import { useQuill } from '../../../lib/useQuill';

export const NonStateControl = () => {
  const ref = useRef<HTMLDivElement>(null);
  useQuill({
    setting: {
      containerRef: ref
    }
  });

  return (
    <div ref={ref} />
  );
};
