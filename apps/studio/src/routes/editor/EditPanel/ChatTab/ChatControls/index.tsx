import { useEditorEngine } from '@/components/Context';
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@onlook/ui/alert-dialog';
import { Button } from '@onlook/ui/button';
import { Icons } from '@onlook/ui/icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '@onlook/ui/tooltip';
import { TooltipArrow } from '@radix-ui/react-tooltip';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import ChatHistory from './ChatHistory';

const ChatControls = observer(() => {
    const editorEngine = useEditorEngine();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDeleteConversation = () => {
        if (!editorEngine.chat.conversation.current) {
            console.error('No conversation to delete');
            return;
        }
        editorEngine.chat.conversation.deleteConversation(
            editorEngine.chat.conversation.current.id,
        );
        setShowDeleteDialog(false);
    };

    return (
        <div className="flex flex-row gap">
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={'ghost'}
                        size={'icon'}
                        className="p-2 w-fit h-fit hover:bg-background-onlook"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={editorEngine.chat.isWaiting}
                    >
                        <Icons.Trash />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    Delete Chat
                    <TooltipArrow className="fill-foreground" />
                </TooltipContent>
            </Tooltip>
            <ChatHistory />
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant={'ghost'}
                        size={'icon'}
                        className="p-2 w-fit h-fit hover:bg-background-onlook"
                        onClick={() => editorEngine.chat.conversation.startNewConversation()}
                        disabled={editorEngine.chat.isWaiting}
                    >
                        <Icons.Plus />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p>New Chat</p>
                    <TooltipArrow className="fill-foreground" />
                </TooltipContent>
            </Tooltip>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to delete this conversation?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            conversation.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button variant={'ghost'} onClick={() => setShowDeleteDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant={'destructive'}
                            className="rounded-md text-sm"
                            onClick={handleDeleteConversation}
                        >
                            Delete
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
});

export default ChatControls;
