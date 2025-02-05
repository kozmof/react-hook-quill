import Quill, { Delta, QuillOptions, } from "quill"
import { RefObject, useEffect, useRef, useState } from "react"


export interface SafeQuillOptions<ModuleOption> extends QuillOptions {
  modules?: Record<string, ModuleOption>
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
   * @param quill a Quill instance
   * @returns 
   */
  setup?: (quill: Quill) => void;
  /**
   * This function is executed only once when Quill is unmounted.
   * 
   * @param quill 
   * @returns 
   */
  cleanup?: (quill: Quill) => void;
}

interface UseQuill {
  setting: Setting;
}


/**
 * A light weight wrapper for using Quill with Hooks.
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
 * @param param0 
 * @returns 
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
        const parent = setting.containerRef.current;

        const editorContainer = parent.appendChild(
          parent.ownerDocument.createElement('div'),
        );
        cleanupRef.current = { parent }

        const quill = new Quill(editorContainer, setting.options);
        exposedQuillRef.current = quill;
        setting.setup?.(exposedQuillRef.current);
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
    }

  }, [
    exposedQuillRef,
    cleanupRef,
    setting,
  ])

  return exposedQuillRef
}

/**
 * 
 * @param setting 
 * @returns 
 */
export const usePersistentDelta = (setting: Setting, initialDelta: Delta = new Delta()) => {
  const deltaRef = useRef<Delta | null>(null);

  const persistentDeltaSetup = (quill: Quill) => {
    if (deltaRef.current) {
      quill.setContents(deltaRef.current);
    } else {
      quill.setContents(initialDelta);
    }
  }

  const persistentDeltaCleanup = (quill: Quill) => {
    deltaRef.current = quill.editor.delta;
  }

  const [persistentDeltaSetting, setPersistentDeltaSetting] = useState<Setting>({
    containerRef: setting.containerRef,
    options: { ...setting.options },
    setup: (quill) => {
      persistentDeltaSetup(quill);
      setting.setup?.(quill);
    },
    cleanup: (quill) => {
      persistentDeltaCleanup(quill);
      setting.cleanup?.(quill);
    }
  })

  const updateSetting = (setting: Setting) => {
    setPersistentDeltaSetting({
      containerRef: setting.containerRef,
      options: { ...setting.options },
      setup: (quill) => {
        persistentDeltaSetup(quill);
        setting.setup?.(quill);
      },
      cleanup: (quill) => {
        persistentDeltaCleanup(quill);
        setting.cleanup?.(quill);
      }
    });
  }

  return { persistentDeltaSetting, updateSetting }
}

/**
 * 
 * @param setting 
 * @returns 
 */
export const useSyncDelta = (setting: Setting, initialDelta: Delta = new Delta()) => {
  const [delta, setDelta] = useState(initialDelta);

  const syncDeltaSetup = (quill: Quill) => {
    quill.setContents(delta);
    quill.on(Quill.events.TEXT_CHANGE, () => {
      setDelta(quill.editor.delta)
    })
  }

  const [syncDeltaSetting, setSynDeltaSetting] = useState<Setting>({
    containerRef: setting.containerRef,
    options: { ...setting.options },
    setup: (quill) => {
      syncDeltaSetup(quill)
      setting.setup?.(quill)
    },
    cleanup: setting.cleanup
  })

  const syncDelta = (quill: Quill | null, delta: Delta) => {
    if (quill !== null) {
      setDelta(delta);
      quill?.setContents(delta);
    }
  }

  const updateSetting = (setting: Setting) => {
    setSynDeltaSetting({
      containerRef: setting.containerRef,
      options: { ...setting.options },
      setup: (quill) => {
        syncDeltaSetup(quill)
        setting.setup?.(quill)
      },
      cleanup: setting.cleanup
    });
  }

  return { delta, setDelta, syncDelta, syncDeltaSetting, updateSetting }
}
