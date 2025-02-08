import { useRef, useState } from 'react';
import { Setting, useQuill } from '../../../lib/useQuill';
import Quill, { Delta } from 'quill';

export const StateControl = () => {
  const ref = useRef<HTMLDivElement>(null);
  // Control delta by useState.
  const [delta, setDelta] = useState(new Delta().insert('Hello Quill'));
  const [text, setText] = useState('');

  /**
   * Set `Setting` as an outside of React lifecycles by useRef.
   * Also, using useState to keep setting is another option.
   * Note that passing `Setting` as a simple object does not work in most of cases,
   * because React create a new object in every re-renders of this component and Quill is unmounted in every state changes.
   */
  const settingRef = useRef<Setting>({
    containerRef: ref,
    setup: (quill: Quill) => {
      quill.setContents(delta);

      quill.on('text-change', () => {
        setDelta(quill.editor.delta);
      });
    }
  });

  const quillRef = useQuill({
    setting: settingRef.current
  });

  const syncDelta = (quill: Quill | null, delta: Delta) => {
    if (quill !== null) {
      setDelta(delta);
      quill.setContents(delta);
    }
  };

  return (
    <>
      <div ref={ref} />

      <label htmlFor='edit-area'>
        Edit
      </label>
      <textarea
        id='edit-area'
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={() => {
        syncDelta(quillRef.current, new Delta(quillRef.current?.editor.delta).insert(text));
        setText('');
      }}>
        Insert
      </button>

      <div>
        {JSON.stringify(delta)}
      </div>
    </>
  );
};
