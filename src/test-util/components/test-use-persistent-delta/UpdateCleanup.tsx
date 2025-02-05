import { useRef, useState } from "react";
import { Setting, useQuill, usePersistentDelta } from "../../../lib/useQuill";
import { Delta } from "quill";

export const UpdateCleanupPD = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState(0);

  const setting: Setting = {
    containerRef: ref,
    cleanup: () => {
      setCounts(counts => counts + 1);
    }
  }
  const { persistentDeltaSetting, updateSetting } = usePersistentDelta(setting, new Delta().insert("Hello Quill"))

  useQuill({
    setting: persistentDeltaSetting
  });

  return (
    <>
      <div ref={ref} />
      <div>{counts}</div>
      <button onClick={() => updateSetting({
        ...setting,
        cleanup: () => {
          setCounts(counts => counts + 100)
        }
      })}>
        Update Cleanup
      </button>
    </>
  )
}
