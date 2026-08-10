import { Extension } from "@tiptap/core";
import { defaultSelectionBuilder, yCursorPlugin } from "@tiptap/y-tiptap";

export interface CollaborationCursorOptions {
  provider: any;
  user: {
    name: string | null;
    color: string | null;
  };
  render?: (user: any) => HTMLElement;
  selectionRender?: (user: any) => any;
}

export interface CollaborationCursorStorage {
  users: Array<{ clientId: number; [key: string]: any }>;
}

const awarenessStatesToArray = (states: Map<number, any>) => {
  const result: Array<{ clientId: number; [key: string]: any }> = [];
  states.forEach((value, key) => {
    result.push({
      clientId: key,
      ...value.user,
    });
  });
  return result;
};

export const CustomCollaborationCursor = Extension.create<
  CollaborationCursorOptions,
  CollaborationCursorStorage
>({
  name: "collaborationCursor",

  addOptions() {
    return {
      provider: null,
      user: {
        name: null,
        color: null,
      },
      render: (user: any) => {
        const cursor = document.createElement("span");
        cursor.classList.add("collaboration-cursor__caret");
        cursor.setAttribute("style", `border-color: ${user.color || "#60a5fa"}`);
        const label = document.createElement("div");
        label.classList.add("collaboration-cursor__label");
        label.setAttribute("style", `background-color: ${user.color || "#60a5fa"}`);
        label.insertBefore(document.createTextNode(user.name || "Anonymous"), null);
        cursor.insertBefore(label, null);
        return cursor;
      },
      selectionRender: defaultSelectionBuilder,
    };
  },

  addStorage() {
    return {
      users: [],
    };
  },

  addProseMirrorPlugins() {
    const awareness = this.options.provider?.awareness;
    if (!awareness) return [];

    return [
      yCursorPlugin(
        (() => {
          awareness.setLocalStateField("user", this.options.user);
          this.storage.users = awarenessStatesToArray(awareness.states);
          awareness.on("update", () => {
            this.storage.users = awarenessStatesToArray(awareness.states);
          });
          return awareness;
        })(),
        {
          cursorBuilder: this.options.render,
          selectionBuilder: this.options.selectionRender,
        }
      ),
    ];
  },
});
