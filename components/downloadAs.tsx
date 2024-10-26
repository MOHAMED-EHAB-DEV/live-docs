import { useStorage, useRoom } from "@liveblocks/react";
import { saveAs } from "file-saver";

const MarkdownDownloader = () => {
    const room = useRoom();
    const documentContent = useStorage((root) => root.document);

    const downloadAsMarkdown = () => {
        console.log(documentContent, "Document Content")
        const markdownContent = documentContent?.content;

        const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8" });
        saveAs(blob, `${room?.info?.name}.md`); // FileSaver's saveAs function to download the file
    };

    return (
        <div>
            <button onClick={downloadAsMarkdown}>Download as Markdown</button>
        </div>
    );
};

export default MarkdownDownloader;
