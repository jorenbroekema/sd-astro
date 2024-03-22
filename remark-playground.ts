import type { VFile } from "vfile";
import type {
  FootnoteDefinition,
  Root,
  Html,
  Blockquote,
  Paragraph,
  ListItem,
} from "mdast";
import { visit } from "unist-util-visit";

const paragraphVisitor = (
  node: Paragraph,
  index?: number,
  parent?: Root | Blockquote | FootnoteDefinition | ListItem
) => {
  if (
    node.type === "paragraph" &&
    node.children[0].type === "text" &&
    node.children[0].value === "~ some-crazy-syntax-start" &&
    index &&
    parent
  ) {
    const serialize = (v) => JSON.stringify(v).replace(/"/g, "&#x22;");
    let tokensData = serialize({});
    let configData = serialize({});
    let scriptData = serialize({});
    let skipAmount = 2;

    for (const child of parent.children.slice(index + 1, index + 4)) {
      if (child.type !== "code") break;

      const url = URL.createObjectURL(
        new Blob([child.value], {
          type: child.lang === "js" ? "text/javascript" : "application/json",
        })
      );

      switch (child.meta) {
        case "tokens":
          tokensData = serialize({ value: child.value, lang: child.lang });
          break;
        case "script":
          scriptData = serialize({ value: child.value, lang: child.lang });
          break;
        case "config":
          configData = serialize({ value: child.value, lang: child.lang });
          break;
      }

      skipAmount++;
    }

    const newNode = {
      type: "html",
      value: `<sd-playground tokens="${tokensData}" config="${configData}" script="${scriptData}"><div style="height: 100%" slot="monaco-editor"></div></sd-playground>`,
    } as Html;

    parent.children.splice(index, skipAmount, newNode);
  }
};

export function remarkPlayground() {
  function transformer(tree: Root, file: VFile) {
    visit(tree, "paragraph", paragraphVisitor);

    console.log(tree);
    return tree;
  }

  return transformer;
}
