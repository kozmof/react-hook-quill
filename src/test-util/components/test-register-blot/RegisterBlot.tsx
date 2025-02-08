import Quill, { Delta } from 'quill';
import { useRef, useState } from 'react';
import { Setting, useQuill } from '../../../lib/useQuill';
import { DividerValue } from './dividerBlot';


export const RegisterBlot = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [delta, setDelta] = useState(new Delta().insert('Hello Quill'));

  const settingRef = useRef<Setting>({
    containerRef: ref,

    setup: (quill: Quill) => {
      quill.setContents(delta);

      quill.on(Quill.events.TEXT_CHANGE, () => {
        setDelta(quill.editor.delta);
      });
    }
  });

  const quillRef = useQuill({
    setting: settingRef.current
  });

  return (
    <>
      <div ref={ref} />
      <button onClick={() => {
        const quill = quillRef.current;
        if (quill) {
          const range = quill.getSelection(true);
          const dividerValue: DividerValue = 'blue';
          quill.insertText(range.index, '\n', Quill.sources.USER);
          quill.insertEmbed(range.index + 1, 'divider', dividerValue, Quill.sources.USER);
          quill.setSelection(range.index + 2, Quill.sources.SILENT);
        }
      }}>
        Add Divider
      </button>
    </>
  );
};
