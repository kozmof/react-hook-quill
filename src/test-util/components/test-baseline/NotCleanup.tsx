import { useRef, useState } from 'react';
import { useQuill } from '../../../lib/useQuill';
import { Delta } from 'quill';

const NonStateControl = () => {
  const ref = useRef<HTMLDivElement>(null);
  const deltaRef = useRef<Delta | null>(null);

  useQuill({
    setting: {
      containerRef: ref,
      setup: (quill) => {
        if (deltaRef.current) {
          quill.setContents(deltaRef.current);
        }
      },
      cleanup: (quill) => {
        deltaRef.current = quill.editor.delta;
      }
    }
  });

  return (
    <>
      <div ref={ref} />
    </>
  );
};

export const NotCleanup = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <button onClick={() => setCount(count => count + 1)}>
        cleanup
      </button>
      <p>
        {count}
      </p>
      <NonStateControl />
    </>
  );
};
