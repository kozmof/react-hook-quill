import { useRef } from "react";
import { useQuill } from "../../../lib/useQuill";
import { Delta } from "quill";

export const CallAPIOnSetup = () => {
  const ref = useRef<HTMLDivElement>(null);
  useQuill({
    setting: {
      containerRef: ref,
      setup: (quill) => {
        quill.setContents(new Delta().insert("Hello Quill"))
      }
    }
  });

  return (
    <div ref={ref} />
  )
}
