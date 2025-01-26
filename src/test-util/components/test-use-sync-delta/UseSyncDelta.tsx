import { useRef, useState } from "react";
import { useQuill, useSyncDelta } from "../../../lib/useQuill";
import { Delta } from "quill";

export const UseSyncDelta1 = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const { delta, syncDelta, syncDeltaSetting } = useSyncDelta({ containerRef: ref })
  const quillRef = useQuill({
    setting: syncDeltaSetting
  });

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
        setText("");
      }}>
        Insert
      </button>

      <div>
        {JSON.stringify(delta)}
      </div>
    </>
  )
}

export const UseSyncDelta2 = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [text, setText] = useState("");
  const { delta, syncDelta, syncDeltaSetting } = useSyncDelta({ containerRef: ref }, "Hello Quill")
  const quillRef = useQuill({
    setting: syncDeltaSetting
  });

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
        setText("");
      }}>
        Insert
      </button>

      <div>
        {JSON.stringify(delta)}
      </div>
    </>
  )
}
