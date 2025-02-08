import { useRef } from 'react';
import { Setting, useQuill, useSyncDelta } from '../../../lib/useQuill';
import { Delta } from 'quill';


export const RegisterModule2 = () => {
  const ref = useRef<HTMLDivElement>(null);

  const setting: Setting = {
    containerRef: ref,
    options: {
      modules: {
        counter: {
          container: '#counter',
          unit: 'word'
        }
      }
    },
    cleanup: () => {
      const container = document.querySelector('#counter');
      if (container) {
        container.textContent = '';
      }
    }
  };

  const { syncDeltaSetting, updateSetting } = useSyncDelta({ ...setting }, new Delta().insert('Hello Quill'));

  useQuill({
    setting: syncDeltaSetting
  });

  return (
    <>
      <div ref={ref} />
      <div id='counter' />

      <button onClick={() => {
        updateSetting({
          ...setting,
          options: {
            ...setting.options,
            modules: {
              counter: {
                container: '#counter',
                unit: 'word'
              }
            }
          }
        });
      }}>
        Count Words
      </button>
      <button onClick={() => updateSetting({
        ...setting,
        options: {
          ...setting.options,
          modules: {
            counter: {
              container: '#counter',
              unit: 'character'
            }
          }
        }
      })}>
        Count Characters
      </button>
    </>
  );
};
