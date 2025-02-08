import { useRef } from 'react';
import { useQuill } from '../../../lib/useQuill';
import { Delta } from 'quill';

export const CallAPIInside = () => {
  const ref = useRef<HTMLDivElement>(null);

  const quillRef = useQuill({
    setting: {
      containerRef: ref
    }
  });

  return (
    <>
      <button onClick={() => {
        const delta = new Delta(quillRef.current?.editor.delta).insert('INSERT');
        quillRef.current?.setContents(delta);
      }}>
        Insert
      </button>
      <div ref={ref} />
    </>
  );
};
