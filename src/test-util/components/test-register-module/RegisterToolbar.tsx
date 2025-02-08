import { useRef } from 'react';
import { useQuill } from '../../../lib/useQuill';

// https://quilljs.com/docs/modules/toolbar#toolbar-module
const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],

  [{ header: 1 }, { header: 2 }],               // custom button values
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ script: 'sub' }, { script: 'super' }],      // superscript/subscript
  [{ indent: '-1' }, { indent: '+1' }],          // outdent/indent
  [{ direction: 'rtl' }],                         // text direction

  [{ size: ['small', false, 'large', 'huge'] }],  // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }],          // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ['clean']                                         // remove formatting button
];

export const RegisterToolbar = () => {
  const ref = useRef<HTMLDivElement>(null);

  useQuill({
    setting: {
      containerRef: ref,
      options: {
        modules: {
          toolbar: toolbarOptions
        }
      }
    }
  });

  return (
    <>
      <div ref={ref} />
    </>
  );
};
