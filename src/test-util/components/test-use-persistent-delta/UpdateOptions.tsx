import { useRef } from "react";
import { Setting, useQuill, usePersistentDelta } from "../../../lib/useQuill";
import { Delta } from "quill";

export const UpdateOptionsPD = () => {
  const ref = useRef<HTMLDivElement>(null);
  const setting: Setting = {
    containerRef: ref,
    options: {
      theme: 'bubble'
    }
  }
  const { persistentDeltaSetting, updateSetting } = usePersistentDelta(setting, new Delta().insert("Hello Quill"))

  useQuill({
    setting: persistentDeltaSetting
  });

  return (
    <>
      <div ref={ref} />

      <button onClick={() => {
        updateSetting({ ...setting, options: { theme: 'snow' } })
      }}>
        snow
      </button>
      <button onClick={() => {
        updateSetting({ ...setting, options: { theme: 'bubble' } })
      }}>
        bubble
      </button>
    </>
  )
}
