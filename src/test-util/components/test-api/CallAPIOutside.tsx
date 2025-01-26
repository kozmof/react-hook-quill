import { useRef } from "react";
import { useQuill } from "../../../lib/useQuill";
import Quill, { Delta } from "quill";

interface EditorProps {
  setup: (quill: Quill) => void
  cleanup: (quill: Quill) => void
}

const Editor = ({ setup, cleanup }: EditorProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useQuill({
    setting: {
      containerRef: ref,
      setup,
      cleanup
    }
  });

  return (
    <div ref={ref} />
  )
}

export const CallAPIOutside = () => {
  const quillRef = useRef<Quill | null>(null);

  const setup = (quill: Quill) => {
    quillRef.current = quill;
  }

  const cleanup = () => {
    quillRef.current = null;
  }

  return (
    <>
      <button onClick={() => {
        const delta = new Delta(quillRef.current?.editor.delta).insert("INSERT FROM OUTSIDE");
        quillRef.current?.setContents(delta);
      }}>
        Insert
      </button>
      <Editor setup={setup} cleanup={cleanup} />
    </>
  )
}
