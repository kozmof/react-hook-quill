import { useRef, useState } from "react";
import { useQuill, usePersistentDelta } from "../../../lib/useQuill";

const InnerUsePersitentDelta = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { persistentDeltaSetting } = usePersistentDelta({ containerRef: ref })

  useQuill({
    setting: persistentDeltaSetting
  });

  return (
    <div ref={ref} />
  )

}

export const UsePersitentDelta = () => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const { persistentDeltaSetting } = usePersistentDelta({ containerRef: ref })

  useQuill({
    setting: persistentDeltaSetting
  });

  return (
    <>
      <button onClick={() => setCount(count => count + 1)}>
        cleanup
      </button>
      <p>
        {count}
      </p>
      <InnerUsePersitentDelta />
    </>
  )
}
