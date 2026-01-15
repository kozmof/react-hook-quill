import Quill, { Delta, QuillOptions } from 'quill';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';


export interface SafeQuillOptions<ModuleOption> extends QuillOptions {
  modules?: Record<string, ModuleOption>;
}

export type Setting<ModuleOption = unknown> = {

  /**
   * A div element to attach a Quill Editor to
   */
  containerRef: RefObject<HTMLDivElement | null>;

  /**
   * Options for initializing a Quill instance
   * See: https://quilljs.com/docs/configuration#options
   */
  options?: SafeQuillOptions<ModuleOption>;

  /**
   * This function is executed only once when Quill is mounted.
   * A common use case is setting up synchronization of the Delta stored on the React side when the Quill side changes.
   * You can read or write a ref object inside.
   */
  setup?: (quill: Quill) => void;

  /**
   * This function is executed only once when Quill is unmounted.
   * You can read or write a ref object inside.
   */
  cleanup?: (quill: Quill) => void;
};

interface UseQuill {
  setting: Setting;
}


/**
 * A lightweight wrapper for using Quill with Hooks.
 * 
 * ----
 * Quill is used as an external system because it modifies HTML elements outside of the React lifecycle.
 * 
 * Note that the returned value, which refers to the Quill object, is instantiated **in** the effect lifecycle.
 * 
 * ----
 * This hook's responsibilities are as follows.
 * - Initialize Quill in the effect lifecycle and return a reference.
 *   In some cases, you need to setup via `setting.setup` to sync the Delta stored on the React side when the Quill side changes.
 * - In the same way as `useEffect` behaves, it *always* cleans up Quill, including all edits, when the React component that holds it is unmounted.
 * 
 * @param useQuillParam Parameters for initializing Quill.
 * @param useQuillParam.setting Settings for setup and cleanup functions, and more.
 * @returns A ref to the Quill instance. See the pitfall of [useRef](https://react.dev/reference/react/useRef) before using this value.
 */
export const useQuill = ({ setting }: UseQuill) => {

  /**
   * Allow access to a Quill instance via the reference.
   * Quill API is accessible via this instance.
   */
  const exposedQuillRef = useRef<Quill | null>(null);

  /**
   * Use for cleanup.
   */
  const cleanupRef = useRef<{ parent: Element } | null>(null);

  /**
   * Use Quill as an external system because it modifies HTML elements outside of the React lifecycle.
   */
  useEffect(() => {
    if (setting.containerRef.current) {
      // Initialization
      if (exposedQuillRef.current === null) {
        try {
          const parent = setting.containerRef.current;

          const editorContainer = parent.appendChild(
            parent.ownerDocument.createElement('div')
          );
          cleanupRef.current = { parent };

          const quill = new Quill(editorContainer, setting.options);
          exposedQuillRef.current = quill;
          setting.setup?.(exposedQuillRef.current);
        } catch (error) {
          console.error('Failed to initialize Quill:', error);
          // Clean up partial initialization if it failed
          if (cleanupRef.current) {
            while (cleanupRef.current.parent.lastChild) {
              cleanupRef.current.parent.removeChild(cleanupRef.current.parent.lastChild);
            }
            cleanupRef.current = null;
          }
        }
      }
    }

    // Clean up
    return () => {
      if (exposedQuillRef.current) {
        setting.cleanup?.(exposedQuillRef.current);
      }
      exposedQuillRef.current = null;

      if (cleanupRef.current) {
        while (cleanupRef.current.parent.lastChild) {
          cleanupRef.current.parent.removeChild(cleanupRef.current.parent.lastChild);
        }
        cleanupRef.current = null;
      }
    };

  }, [setting]);

  return exposedQuillRef;
};

/**
 * This hook prevents tracking of user edits on the React side but retains changes on the Quill side even when the parent component re-renders.
 * 
 * @param setting Settings for setup and cleanup functions, and more.
 * @param [initialDelta] an initial value of `Delta`
 * @returns obj
 * @returns obj.persistentDeltaSetting the new setting, which is composed of the setting passing by
 * @returns obj.updateSetting the function for updating settings
 */
export const usePersistentDelta = (setting: Setting, initialDelta: Delta = new Delta()) => {
  const deltaRef = useRef<Delta | null>(null);
  const initialDeltaRef = useRef(initialDelta);

  const persistentDeltaSetup = useCallback((quill: Quill) => {
    if (deltaRef.current) {
      quill.setContents(deltaRef.current);
    } else {
      quill.setContents(initialDeltaRef.current);
    }
  }, []);

  const persistentDeltaCleanup = useCallback((quill: Quill) => {
    deltaRef.current = quill.editor.delta;
  }, []);

  const [persistentDeltaSetting, setPersistentDeltaSetting] = useState<Setting>(() => ({
    containerRef: setting.containerRef,
    options: setting.options,
    setup: (quill) => {
      persistentDeltaSetup(quill);
      setting.setup?.(quill);
    },
    cleanup: (quill) => {
      persistentDeltaCleanup(quill);
      setting.cleanup?.(quill);
    }
  }));

  const updateSetting = useCallback((setting: Setting) => {
    setPersistentDeltaSetting({
      containerRef: setting.containerRef,
      options: setting.options,
      setup: (quill) => {
        persistentDeltaSetup(quill);
        setting.setup?.(quill);
      },
      cleanup: (quill) => {
        persistentDeltaCleanup(quill);
        setting.cleanup?.(quill);
      }
    });
  }, [persistentDeltaSetup, persistentDeltaCleanup]);

  return {
    persistentDeltaSetting,
    updateSetting
  };
};

/**
 * 
 * This hook automatically sets up the state of Delta with React.
 * 
 * Note that you may not really need to sync Delta with React in your application. Syncing Delta triggers a re-render with every user's edit and it may become an overhead in some cases.
 * 
 * @param setting Settings for setup and cleanup functions, and more.
 * @param [initialDelta] an initial value of `Delta`
 * @returns obj 
 * @returns obj.delta A state of Delta on the React side. User edits are automatically synced.
 * @returns obj.setDelta Minor use cases. Note that it changes the state of Delta only on the React side. Use syncDelta if you update both sides.
 * @returns obj.syncDelta Change the Delta both on the React and Quill sides at once.
 * @returns obj.syncDeltaSetting the new setting, which is composed of the setting passing by
 * @returns obj.updateSetting the function for updating settings
 */
export const useSyncDelta = (setting: Setting, initialDelta: Delta = new Delta()) => {
  const [delta, setDelta] = useState(initialDelta);
  const textChangeHandlerRef = useRef<null | (() => void)>(null);

  const syncDeltaSetup = useCallback((quill: Quill) => {
    quill.setContents(delta);
    if (!textChangeHandlerRef.current) {
      textChangeHandlerRef.current = () => {
        setDelta(quill.editor.delta);
      };
      quill.on(Quill.events.TEXT_CHANGE, textChangeHandlerRef.current);
    }
  }, [delta]);

  const syncDeltaCleanup = useCallback((quill: Quill) => {
    if (textChangeHandlerRef.current) {
      quill.off(Quill.events.TEXT_CHANGE, textChangeHandlerRef.current);
      textChangeHandlerRef.current = null;
    }
  }, []);

  const [syncDeltaSetting, setSynDeltaSetting] = useState<Setting>(() => ({
    containerRef: setting.containerRef,
    options: setting.options,
    setup: (quill) => {
      syncDeltaSetup(quill);
      setting.setup?.(quill);
    },
    cleanup: (quill) => {
      syncDeltaCleanup(quill);
      setting.cleanup?.(quill);
    }
  }));

  const syncDelta = useCallback((quill: Quill | null, delta: Delta) => {
    if (quill === null) {
      console.warn('syncDelta called with null Quill instance');
      return;
    }
    setDelta(delta);
    quill.setContents(delta);
  }, []);

  const updateSetting = useCallback((setting: Setting) => {
    setSynDeltaSetting({
      containerRef: setting.containerRef,
      options: setting.options,
      setup: (quill) => {
        syncDeltaSetup(quill);
        setting.setup?.(quill);
      },
      cleanup: (quill) => {
        syncDeltaCleanup(quill);
        setting.cleanup?.(quill);
      }
    });
  }, [syncDeltaSetup, syncDeltaCleanup]);

  return {
    delta,
    setDelta,
    syncDelta,
    syncDeltaSetting,
    updateSetting
  };
};
