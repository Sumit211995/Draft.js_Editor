import React from 'react';
import {useRef, useState} from 'react';
import {Editor, EditorState, RichUtils, getDefaultKeyBinding, KeyBindingUtil, convertToRaw} from 'draft-js';
import '../index.css';


const styleMap = {
  'red': {
    color: 'red'
  }
};


export default function MyEditor() {
  const [editorState, setEditorState] = useState(
    EditorState.createEmpty()
  );

  const editor = useRef(null);
 
  function focusEditor() {
    editor.current.focus();
  }
 
  React.useEffect(() => {
    focusEditor()
  }, []);

  
const editorContent = editorState.getCurrentContent().getPlainText('\u0001');
console.log(editorContent);

    const [pressedKey, setPressedKey] = useState([]);
    console.log('array ' ,pressedKey);

  const keyBindingFn = (event) => {
    console.log(event.keyCode);
    setPressedKey([...pressedKey, event.key]);
    const keyString = pressedKey.join('');
    if(keyString.startsWith('Shift# ')){
      setPressedKey([]);
      return 'heading'; 
    }
    if (keyString === 'Shift* ') {
      setPressedKey([]); 
      return 'bold'; 
    }
    if (keyString === 'Shift** ') {
      setPressedKey([]); 
      return 'red'; 
    }
    if (keyString === 'Shift*** ') {
      setPressedKey([]); 
      return 'underline'; 
    }
    if(keyString === 'Enter' || pressedKey.includes('Enter')){
      setPressedKey([]);
      return 'normal'
    }
    return getDefaultKeyBinding(event);
  }

  const handleKeyCommand = (e) => {
    let newState;
    if(e === 'heading'){
      newState = RichUtils.toggleBlockType(editorState, 'header-one');
    }
    if (e === 'bold') {
      newState = RichUtils.toggleInlineStyle(editorState, 'BOLD');
    }
    if (e === 'red') {
      newState = RichUtils.toggleInlineStyle(editorState, 'red');
    }
    if (e === 'underline') {
      newState = RichUtils.toggleInlineStyle(editorState, 'UNDERLINE');
    }
    if (e === 'normal') {
      newState = RichUtils.toggleInlineStyle(editorState, 'unstyled');
    }

    if (newState) {
      setEditorState(newState);
      return 'handled';
    }
    return 'not-handled';
  }
 
  return (
    <div className='editor' onClick={focusEditor}>
      <Editor
        ref={editor}
        editorState={editorState}
        onChange={(editorState) => {
          setEditorState(editorState);
          if(pressedKey === 'Enter')
          setPressedKey([]);
        }}
        keyBindingFn={keyBindingFn}
        handleKeyCommand={handleKeyCommand}
        customStyleMap={styleMap}
      />
    </div>
  );
}