import { useState } from 'react';
import { NonStateControl } from './NonStateControl';

export const Cleanup = () => {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count => count + 1)}>
        cleanup
      </button>
      <p>
        {count}
      </p>
      <NonStateControl />
    </>
  );
};
