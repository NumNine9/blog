// components/MarkdownEditor.tsx
import React, { useState } from "react";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

// Dynamic import to prevent SSR issues
const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface MarkdownEditorProps {
  initialContent?: string;
  onContentChange?: (content: string) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialContent = "",
  onContentChange,
}) => {
  const [value, setValue] = useState<string>(initialContent);

  const handleChange = (content?: string) => {
    const newValue = content || "";
    setValue(newValue);
    if (onContentChange) onContentChange(newValue);
  };

  return (
    <div className="w-full">
      <MDEditor
        value={value}
        onChange={handleChange}
        height={600}
        hideToolbar={false}
        data-color-mode="light"
        textareaProps={{
          placeholder: "Write your blog post here...",
        }}
      />
    </div>
  );
};

export default MarkdownEditor;
