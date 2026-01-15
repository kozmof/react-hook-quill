import { useRef, useState } from 'react';
import { useQuill, useSyncDelta } from '../../../lib/useQuill';
import { Delta } from 'quill';

export const SyncDeltaNull = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [callCount, setCallCount] = useState(0);
  const { syncDelta, syncDeltaSetting } = useSyncDelta({ containerRef: ref });
  const quillRef = useQuill({ setting: syncDeltaSetting });

  return (
    <>
      <div ref={ref} />
      <button
        onClick={() => {
          // Call syncDelta with null to trigger the warning path
          syncDelta(null, new Delta().insert('test'));
          setCallCount(count => count + 1);
        }}
      >
        Call with null
      </button>
      <button
        onClick={() => {
          // Call syncDelta with actual quill instance
          syncDelta(quillRef.current, new Delta().insert('with quill'));
          setCallCount(count => count + 1);
        }}
      >
        Call with quill
      </button>
      <div data-testid="call-count">{callCount}</div>
    </>
  );
};
