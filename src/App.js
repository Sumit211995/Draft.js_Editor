import React from "react";
import { useRef, useState, useEffect } from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  Modifier,
  convertFromRaw,
  KeyBindingUtil,
  convertToRaw,
} from "draft-js";
import "./index.css";

const style = {
  red: {
    color: "red",
  },
};

const App = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const editor = useRef(null);

  function focusEditor() {
    editor.current.focus();
  }

  useEffect(() => {
    // Load the editor state from localStorage on page load (if available)
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      try {
        const parsedContent = JSON.parse(savedContent);
        const contentState = convertFromRaw(parsedContent); // Convert raw to ContentState
        setEditorState(EditorState.createWithContent(contentState));
      } catch (error) {
        console.error("Error loading saved content:", error);
      }
    }
  }, []);

  

  const [pressedKey, setPressedKey] = useState([]);

  const keyBindingFn = (event) => {
    if (event.key === " ") {
      const selection = editorState.getSelection();
      const content = editorState.getCurrentContent();
      const block = content.getBlockForKey(selection.getStartKey());
      const text = block.getText();

      if (text === "#") {
        setPressedKey(["heading"]);
        return "heading";
      }
      if (text === "*") {
        setPressedKey(["bold"]);
        return "bold";
      }
      if (text === "**") {
        setPressedKey(["red"]);
        return "red";
      }
      if (text === "***") {
        setPressedKey(["underline"]);
        return "underline";
      }
    }
    return getDefaultKeyBinding(event);
  };

  const removeCharactersAndStyle = (command) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();

    // Create a selection for the markdown characters
    const charSelection = selection.merge({
      anchorOffset: 0,
      focusOffset:
        command === "heading"
          ? 1
          : command === "bold"
          ? 1
          : command === "red"
          ? 2
          : command === "underline"
          ? 3
          : 0,
    });

    // Remove the characters
    const newContent = Modifier.replaceText(content, charSelection, "");

    // Push the new content
    let newEditorState = EditorState.push(
      editorState,
      newContent,
      "remove-range"
    );

    // Apply the style
    if (command === "heading") {
      newEditorState = RichUtils.toggleBlockType(newEditorState, "header-one");
    } else if (command === "bold") {
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, "BOLD");
    } else if (command === "red") {
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, "red");
    } else if (command === "underline") {
      newEditorState = RichUtils.toggleInlineStyle(newEditorState, "UNDERLINE");
    }

    return newEditorState;
  };

  const handleKeyCommand = (command) => {
    if (["heading", "bold", "red", "underline"].includes(command)) {
      const newState = removeCharactersAndStyle(command);
      if (newState) {
        setEditorState(newState);
        return "handled";
      }
    }

    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleReturn = (e) => {
    setPressedKey([]);
    return "not-handled";
  };

  const saveEditorContent = () => {
    const contentState = editorState.getCurrentContent();
    const contentRaw = convertToRaw(contentState); // Convert ContentState to raw format
    localStorage.setItem("editorContent", JSON.stringify(contentRaw)); // Save to localStorage
    alert("Editor content saved!");
  };

  return (
    <div className="App">
      <div className="heading">
        <h1>Demo Editor By Sumit Kaktwan</h1>

        <button onClick={saveEditorContent}>Save</button>
      </div>

      <div className="editor" onClick={focusEditor}>
        <Editor
          ref={editor}
          editorState={editorState}
          onChange={(editorState) => {
            setEditorState(editorState);
            if (pressedKey === "Enter") setPressedKey([]);
          }}
          keyBindingFn={keyBindingFn}
          handleKeyCommand={handleKeyCommand}
          customStyleMap={style}
          handleReturn={handleReturn}
        />
      </div>
    </div>
  );
};

export default App;
