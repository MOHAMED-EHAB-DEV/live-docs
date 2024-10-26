import { getDocument } from "@/lib/actions/room.action";
import { liveblocks } from "@/lib/liveblocks";
import { withLexicalDocument } from "@liveblocks/node-lexical";
import { saveAs } from "file-saver";

const MarkdownDownloader = async ({ roomId, userId }: { roomId: string, userId: string }) => {
    const room = await getDocument({ roomId, userId });

    const downloadAsMarkdown = async () => {
        const markdown = await withLexicalDocument(
            { roomId, client: liveblocks },
            (doc) => doc.toMarkdown()
        );

        const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
        saveAs(blob, `${room?.info?.name}.md`); // FileSaver's saveAs function to download the file
    };

    return (
        <div>
            <button onClick={downloadAsMarkdown}>Download as Markdown</button>
        </div>
    );
};

export default MarkdownDownloader;
