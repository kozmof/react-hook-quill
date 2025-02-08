import { BlockEmbed } from 'quill/blots/block';

export type DividerValue = 'blue' | 'red';

export class DividerBlot extends BlockEmbed {
  static blotName = 'divider';

  static tagName = 'hr';

  static create (value: DividerValue) {
    const node = super.create(value);
    if (node instanceof HTMLElement) {
      node.setAttribute('style', `border: 1px solid ${value};`);
    }
    return node;
  }
}
