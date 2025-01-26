import { memo, useState } from "react";
import { NonStateControl } from "./NonStateControl";


const NonStateButMemoized = memo(NonStateControl);

export const NotCleanup = () => {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count => count + 1)}>
        cleanup
      </button>
      <p>
        {count}
      </p>
      <NonStateButMemoized />
    </>
  )
}
