import Quill, { Module } from "quill";

export type CounterModuleOptions = {
  container: '#counter';
  unit: "word" | "character" ;
}

// https://quilljs.com/docs/guides/building-a-custom-module
export class Counter extends Module<CounterModuleOptions> {
  public quill: Quill
  public options: CounterModuleOptions

  constructor(quill: Quill, options: CounterModuleOptions) {
    super(quill, options);
    this.quill = quill;
    this.options = options;
    quill.on(Quill.events.TEXT_CHANGE, this.update.bind(this));
  }

  calculate() {
    const text = this.quill.getText();

    if (this.options.unit === 'word') {
      const trimmed = text.trim();
      // Splitting empty text returns a non-empty array
      return trimmed.split(/\s+/).length;
    } else {
      return text.length;
    }
  }

  update() {
    const length = this.calculate();
    let label = this.options.unit;
    if (length !== 1) {
      label += 's';
    }

    const container = <HTMLElement | null>document.querySelector(this.options.container);
    if(container) {
      // Use textContent instead of innerText.
      // https://github.com/jsdom/jsdom/issues/1245
      container.textContent = `${length} ${label}`;
    }
  }
}
