import { LitElement, css, html } from "lit";
import { bundle } from "../utils/rollup-bundle";
import { changeLang, init } from "../monaco/monaco.js";

const defaults = {
  tokens: {
    colors: {
      red: {
        value: "#ff0000",
        type: "color",
      },
    },
  },
  config: {
    platforms: {
      css: {
        transformGroup: "css",
        files: [
          {
            destination: "vars.css",
            format: "css/variables",
          },
        ],
      },
    },
  },
};

const getLang = (lang: string) => {
  const langMap = {
    js: "javascript",
  } as Record<string, string>;

  return langMap[lang] ?? lang;
};

class SdPlayground extends LitElement {
  static get properties() {
    return {
      tokens: {
        reflect: true,
        type: String,
      },
      config: {
        reflect: true,
        type: String,
      },
      script: {
        reflect: true,
        type: String,
      },
    };
  }

  declare tokens: string;
  declare config: string;
  declare script: string;
  declare output: string;
  declare editor: any;
  declare hasInitialized: Promise<void>;
  declare hasInitializedResolve: (value: void) => void;

  constructor() {
    super();
    this.tokens = "{}";
    this.config = "{}";
    this.script = '{ "lang": "js", "value": "" }';
    this.output = '{ "lang": "css", "value": "" }';
    this.editor = undefined;
    this.hasInitialized = new Promise((resolve) => {
      this.hasInitializedResolve = resolve;
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.init();
  }

  async init() {
    await this.initData();
    await this.initMonaco();
    this.hasInitializedResolve();
    this.fileSwitch("config");
  }

  async initMonaco() {
    await this.updateComplete;
    const slotEl = this.shadowRoot?.querySelector(
      'slot[name="monaco-editor"]'
    ) as HTMLSlotElement;
    const editorElem = slotEl.assignedNodes()[0];
    this.editor = await init(editorElem);
  }

  async initData() {
    const [, tokens] = await Promise.all([
      this.initScript(),
      this.initTokens(),
    ]);
    const cfg = await this.initConfig(tokens);
    return cfg;
  }

  async initScript() {
    if (this.script) {
      const scriptData = JSON.parse(this.script);
      const bundled = await bundle(scriptData.value);
      const url = URL.createObjectURL(
        new Blob([bundled], {
          type: "text/javascript",
        })
      );
      import(url);
    }
  }

  async initTokens() {
    let tokens = defaults.tokens;
    if (this.tokens) {
      const tokensData = JSON.parse(this.tokens);
      if (tokensData.lang === "js") {
        const bundled = await bundle(tokensData.value);
        const url = URL.createObjectURL(
          new Blob([bundled], {
            type: "text/javascript",
          })
        );
        tokens = (await import(url)).default;
      } else {
        tokens = JSON.parse(tokensData.value);
      }
    }
    return tokens;
  }

  async initConfig(tokens: Record<string, unknown>) {
    let sdConfig = { ...defaults.config, tokens };
    if (this.config) {
      const configData = JSON.parse(this.config);
      if (configData.lang === "js") {
        const bundled = await bundle(configData.value);
        const url = URL.createObjectURL(
          new Blob([bundled], {
            type: "text/javascript",
          })
        );
        sdConfig = (await import(url)).default;
      } else if (configData.value) {
        sdConfig = JSON.parse(configData.value);
      }
      sdConfig.tokens = sdConfig.tokens ?? tokens;
    }

    return sdConfig;
  }

  render() {
    return html`
      <p>Playground</p>
      <label>
        <input
          @change=${(ev: Event) => {
            this.fileSwitch((ev.target as HTMLInputElement).value as "tokens");
          }}
          type="radio"
          value="tokens"
          name="file-switch"
        />
        Tokens
      </label>
      <label>
        <input
          @change=${(ev: Event) => {
            this.fileSwitch((ev.target as HTMLInputElement).value as "config");
          }}
          type="radio"
          value="config"
          name="file-switch"
          checked
        />
        Config
      </label>
      <label>
        <input
          @change=${(ev: Event) => {
            this.fileSwitch((ev.target as HTMLInputElement).value as "script");
          }}
          type="radio"
          value="script"
          name="file-switch"
        />
        Script
      </label>
      <label>
        <input
          @change=${(ev: Event) => {
            this.fileSwitch((ev.target as HTMLInputElement).value as "output");
          }}
          type="radio"
          value="output"
          name="file-switch"
        />
        Output
      </label>
      <slot name="monaco-editor"></slot>
    `;
  }

  async fileSwitch(val: "tokens" | "config" | "script" | "output") {
    await this.hasInitialized;

    let data = {
      lang: JSON.parse(this[val as keyof SdPlayground]).lang ?? "json",
      value:
        JSON.parse(this[val]).value ??
        JSON.stringify(defaults[val as keyof typeof defaults], null, 2),
    };

    this.editor.setValue(data.value);

    await changeLang(getLang(data.lang), this.editor);
  }
}

customElements.define("sd-playground", SdPlayground);
