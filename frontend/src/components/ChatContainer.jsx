import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
    const {
        messages,
        getMessages,
        isMessagesLoading,
        selectedUser,
        subscribeToMessages,
        unsubscribeFromMessages,
    } = useChatStore();
    const { authUser } = useAuthStore();
    const messageEndRef = useRef(null);

    // Fetch messages and subscribe to new messages when the selected user changes
    useEffect(() => {
        console.log("Selected user:", selectedUser); // Debug log
        if (selectedUser?._id) {
            console.log("Fetching messages for user:", selectedUser._id); // Debug log
            getMessages(selectedUser._id);
    
            // Subscribe to messages only if the selected user changes
            subscribeToMessages();
        }
    
        // Cleanup: Unsubscribe from messages when the component unmounts or selectedUser changes
        return () => {
            unsubscribeFromMessages();
        };
    }, [selectedUser, selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);
    
    // Scroll to the bottom of the chat when new messages are added
    useEffect(() => {
        if (messageEndRef.current && messages) {
            messageEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Show skeleton loading state while messages are being fetched
    if (isMessagesLoading) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <ChatHeader />
                <MessageSkeleton />
                <MessageInput />
            </div>
        );
    }

    // If no user is selected, show a placeholder
    if (!selectedUser) {
        return (
            <div className="flex-1 flex flex-col overflow-auto">
                <div className="flex-1 flex items-center justify-center">
                    <p className="text-base-content/70">Select a user to start chatting</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto">
            {/* Chat Header */}
            <ChatHeader />

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message._id}
                        className={`chat ${message.senderId === authUser._id ? "chat-end" : "chat-start"}`}
                    >
                        {/* Profile Picture */}
                        <div className="chat-image avatar">
                            <div className="size-10 rounded-full border">
                                <img
                                    src={
                                        message.senderId === authUser._id
                                            ? authUser.profilePic || "/avatar.png"
                                            : selectedUser.profilePic || "/avatar.png"
                                    }
                                    alt="profile pic"
                                />
                            </div>
                        </div>

                        {/* Message Header (Timestamp) */}
                        <div className="chat-header mb-1">
                            <time className="text-xs opacity-50 ml-1">
                                {formatMessageTime(message.createdAt)}
                            </time>
                        </div>

                        {/* Message Content */}
                        <div className="chat-bubble flex flex-col">
                            {message.image && (
                                <img
                                    src={message.image}
                                    alt="Attachment"
                                    className="sm:max-w-[200px] rounded-md mb-2"
                                />
                            )}
                            {message.text && <p>{message.text}</p>}
                        </div>
                    </div>
                ))}
                <div ref={messageEndRef} />
            </div>

            {/* Message Input */}
            <MessageInput />
        </div>
    );
};

export default ChatContainer;