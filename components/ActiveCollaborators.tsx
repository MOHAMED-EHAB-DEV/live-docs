import Image from "next/image";
import { useOthers } from "@liveblocks/react/suspense";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"


const ActiveCollaborators = ({ authorId }: { authorId: string }) => {
    const others = useOthers();

    const collaborators = others.map((other) => other.info);
    return (
        <ul className="collaborators-list">
            {collaborators.map(({ id, avatar, name, color, email }) => (
                <TooltipProvider delayDuration={100} key={id}>
                    <Tooltip>
                        <TooltipTrigger>
                            <li >
                                <Image
                                    src={avatar}
                                    alt={name}
                                    width={100}
                                    height={100}
                                    className="inline-block size-8 rounded-full ring-2 ring-dark-100"
                                    style={{ border: `3px solid ${color}` }}
                                />
                            </li>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{authorId === email ? "You" : name}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            ))}
        </ul>
    );
};

export default ActiveCollaborators;
