import { useRef } from "react";
import { Setting, useQuill, useSyncDelta } from "../../../lib/useQuill";
import { Delta } from "quill";

export const UpdateOptions = () => {
  const ref = useRef<HTMLDivElement>(null);
  const setting: Setting = {
    containerRef: ref,
    options: {
      theme: 'bubble'
    }
  }
  const { syncDeltaSetting, updateSetting } = useSyncDelta(setting, new Delta().insert("Hello Quill"))

  useQuill({
    setting: syncDeltaSetting
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
