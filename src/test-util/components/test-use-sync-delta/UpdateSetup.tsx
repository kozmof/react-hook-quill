import { useRef, useState } from "react";
import { Setting, useQuill, useSyncDelta } from "../../../lib/useQuill";
import { Delta } from "quill";

export const UpdateSetup = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState(0);

  const setting: Setting = {
    containerRef: ref,
    setup: () => {
      setCounts(counts => counts + 1);
    }
  }
  const { syncDeltaSetting, updateSetting } = useSyncDelta(setting, new Delta().insert("Hello Quill"))

  useQuill({
    setting: syncDeltaSetting
  });

  return (
    <>
      <div ref={ref} />
      <div>{counts}</div>
      <button onClick={() => updateSetting({
        ...setting,
        setup: () => {
          setCounts(counts => counts + 100)
        }
      })}>
        Update Setup
      </button>
    </>
  )
}
