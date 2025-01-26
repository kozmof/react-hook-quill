import { useRef, useState } from "react";
import { Setting, useQuill, useSyncDelta } from "../../../lib/useQuill";

export const UpdateCleanup = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [counts, setCounts] = useState(0);

  const setting: Setting = {
    containerRef: ref,
    cleanup: () => {
      setCounts(counts => counts + 1);
    }
  }
  const { syncDeltaSetting, updateSetting } = useSyncDelta(setting, "Hello Quill")

  useQuill({
    setting: syncDeltaSetting
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
