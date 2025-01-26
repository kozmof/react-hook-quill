import Quill, { Delta } from "quill";
import { useRef, useState } from "react";
import { Setting, useQuill } from "../../../lib/useQuill";
import { CounterModuleOptions } from "./counter";


export const RegisterModule1 = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [delta, setDelta] = useState(new Delta().insert("Hello Quill"));

  const settingRef = useRef<Setting<CounterModuleOptions>>({
    containerRef: ref,
    options: {
      modules: {
        counter: {
          container: "#counter",
          unit: "word"
        }
      }
    },

    setup: (quill: Quill) => {
      quill.setContents(delta);

      quill.on(Quill.events.TEXT_CHANGE, () => {
        setDelta(quill.editor.delta);
      })
    }
  })

  useQuill({
    setting: settingRef.current
  });

  return (
    <>
      <div ref={ref} />
      <div id='counter' />
    </>
  )
}
