import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,
    notificationCount: {}, // Track unread messages

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/messages/users");
            set({ users: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({ messages: res.data });
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({ messages: [...messages, res.data] });

            // Emit sendMessage event to the backend
            const socket = useAuthStore.getState().socket;
            socket.emit("sendMessage", {
                receiverId: selectedUser._id, // Include receiverId
                senderId: useAuthStore.getState().authUser._id,
                text: messageData.text,
            });
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        console.log("Subscribing to newMessage events"); // Debug log

        // Clean up any existing listeners to avoid duplicates
        socket.off("newMessage");

        socket.on("newMessage", (newMessage) => {
            console.log("New message received:", newMessage); // Debug log

            const { authUser } = useAuthStore.getState();

            // If the message is for the current user, play the notification sound
            if (newMessage.receiverId === authUser._id) {
                const notificationSound = document.getElementById("notificationSound");
                console.log("Notification sound element:", notificationSound); // Debug log
                if (notificationSound) {
                    notificationSound.play(); // Play the sound
                }

                // Increment the notification count for the sender
                set((state) => {
                    const currentCount = state.notificationCount[newMessage.senderId] || 0;
                    return {
                        notificationCount: {
                            ...state.notificationCount,
                            [newMessage.senderId]: currentCount + 1,
                        },
                    };
                });
            }

            // Add the new message to the messages list if the chat is open
            const { selectedUser } = get();
            if (selectedUser?._id === newMessage.senderId) {
                set((state) => ({
                    messages: [...state.messages, newMessage],
                }));
            }
        });
    },

    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        console.log("Unsubscribing from newMessage events"); // Debug log
        socket.off("newMessage"); // Remove the event listener
    },

    setSelectedUser: (selectedUser) => {
        if (!selectedUser) {
            // If selectedUser is null, reset the selectedUser state
            set({ selectedUser: null });
            return;
        }

        // Reset the notification count for the selected user
        set((state) => ({
            selectedUser,
            notificationCount: {
                ...state.notificationCount,
                [selectedUser._id]: 0, // Reset count for the selected user
            },
        }));
    },
}));