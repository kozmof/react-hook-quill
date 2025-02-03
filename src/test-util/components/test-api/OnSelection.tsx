import { useRef, useState } from "react";
import { useQuill } from "../../../lib/useQuill";
import Quill, { Delta } from "quill";

export const OnSelection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState("")

  useQuill({
    setting: {
      containerRef: ref,
      setup: (quill) => {
        quill.setContents(new Delta().insert("Hello Quill"));
        quill.on(Quill.events.SELECTION_CHANGE, (range) => {
          if (range && range.length !== 0) {
            setSelection(quill.getText(range.index, range.length));
          } else {
            setSelection("");
          }
        })
      }
    }
  });

  return (
    <>
      <div ref={ref} />
      <div>{selection}</div>
    </>
  )
}
