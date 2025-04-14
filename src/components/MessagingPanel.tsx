import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Send, User, Users } from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRole: "patient" | "healthcare" | "admin";
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

const MessagingPanel = () => {
  // Mock data for conversations
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      participantId: "user1",
      participantName: "Dr. Sarah Johnson",
      participantAvatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      participantRole: "healthcare",
      lastMessage: "Your test results look good. No concerns at this time.",
      lastMessageTime: new Date(2023, 5, 15, 14, 30),
      unreadCount: 2,
    },
    {
      id: "2",
      participantId: "user2",
      participantName: "James Wilson",
      participantAvatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=james",
      participantRole: "patient",
      lastMessage: "Thank you for the quick response!",
      lastMessageTime: new Date(2023, 5, 14, 9, 15),
      unreadCount: 0,
    },
    {
      id: "3",
      participantId: "user3",
      participantName: "Dr. Michael Chen",
      participantAvatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      participantRole: "healthcare",
      lastMessage: "I've scheduled your follow-up appointment for next week.",
      lastMessageTime: new Date(2023, 5, 13, 16, 45),
      unreadCount: 1,
    },
    {
      id: "4",
      participantId: "user4",
      participantName: "Admin Support",
      participantAvatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      participantRole: "admin",
      lastMessage: "Your account permissions have been updated.",
      lastMessageTime: new Date(2023, 5, 10, 11, 20),
      unreadCount: 0,
    },
  ]);

  // Mock data for messages in the current conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m1",
      senderId: "user1",
      senderName: "Dr. Sarah Johnson",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      content: "Hello! I've reviewed your recent lab results.",
      timestamp: new Date(2023, 5, 15, 14, 25),
      isRead: true,
    },
    {
      id: "m2",
      senderId: "currentUser",
      senderName: "You",
      content: "Hi Dr. Johnson, thank you for checking. How do they look?",
      timestamp: new Date(2023, 5, 15, 14, 27),
      isRead: true,
    },
    {
      id: "m3",
      senderId: "user1",
      senderName: "Dr. Sarah Johnson",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      content: "Your test results look good. No concerns at this time.",
      timestamp: new Date(2023, 5, 15, 14, 30),
      isRead: false,
    },
    {
      id: "m4",
      senderId: "user1",
      senderName: "Dr. Sarah Johnson",
      senderAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      content:
        "I would recommend a follow-up in 6 months to monitor your progress.",
      timestamp: new Date(2023, 5, 15, 14, 31),
      isRead: false,
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<string>("1");
  const [newMessage, setNewMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Handle sending a new message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const message: Message = {
      id: `m${messages.length + 1}`,
      senderId: "currentUser",
      senderName: "You",
      content: newMessage,
      timestamp: new Date(),
      isRead: true,
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conversation) =>
    conversation.participantName
      .toLowerCase()
      .includes(searchQuery.toLowerCase()),
  );

  // Format date for display
  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatConversationTime = (date?: Date) => {
    if (!date) return "";

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return formatMessageTime(date);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="bg-background h-full w-full p-4">
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle>Messaging Center</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="conversations" className="h-[calc(100%-1rem)]">
            <div className="border-b px-4">
              <TabsList className="mb-2">
                <TabsTrigger
                  value="conversations"
                  className="flex items-center gap-2"
                >
                  <Users size={16} />
                  Conversations
                </TabsTrigger>
                <TabsTrigger
                  value="contacts"
                  className="flex items-center gap-2"
                >
                  <User size={16} />
                  Contacts
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="conversations"
              className="h-[calc(100%-3rem)] flex mt-0 pt-0"
            >
              <div className="w-1/3 border-r h-full">
                <div className="p-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search conversations..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <ScrollArea className="h-[calc(100%-3.5rem)]">
                  <div className="space-y-1 p-2">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`flex items-start gap-3 p-2 rounded-md cursor-pointer hover:bg-accent/50 ${selectedConversation === conversation.id ? "bg-accent" : ""}`}
                        onClick={() => setSelectedConversation(conversation.id)}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={conversation.participantAvatar} />
                          <AvatarFallback>
                            {conversation.participantName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium leading-none truncate">
                              {conversation.participantName}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {formatConversationTime(
                                conversation.lastMessageTime,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <Badge
                                variant="default"
                                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                              >
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1">
                            <Badge
                              variant="outline"
                              className="text-xs px-1 py-0"
                            >
                              {conversation.participantRole === "healthcare"
                                ? "Doctor"
                                : conversation.participantRole === "admin"
                                  ? "Admin"
                                  : "Patient"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="w-2/3 h-full flex flex-col">
                {selectedConversation && (
                  <>
                    <div className="border-b p-3 flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={
                            conversations.find(
                              (c) => c.id === selectedConversation,
                            )?.participantAvatar
                          }
                        />
                        <AvatarFallback>
                          {conversations
                            .find((c) => c.id === selectedConversation)
                            ?.participantName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {
                            conversations.find(
                              (c) => c.id === selectedConversation,
                            )?.participantName
                          }
                        </h3>
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {conversations.find(
                            (c) => c.id === selectedConversation,
                          )?.participantRole === "healthcare"
                            ? "Doctor"
                            : conversations.find(
                                  (c) => c.id === selectedConversation,
                                )?.participantRole === "admin"
                              ? "Admin"
                              : "Patient"}
                        </Badge>
                      </div>
                    </div>

                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.senderId === "currentUser" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                message.senderId === "currentUser"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              {message.senderId !== "currentUser" && (
                                <div className="flex items-center gap-2 mb-1">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={message.senderAvatar} />
                                    <AvatarFallback>
                                      {message.senderName.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs font-medium">
                                    {message.senderName}
                                  </span>
                                </div>
                              )}
                              <p className="text-sm">{message.content}</p>
                              <div className="text-xs mt-1 text-right">
                                {formatMessageTime(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    <div className="border-t p-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type your message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                        />
                        <Button onClick={handleSendMessage}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="h-[calc(100%-3rem)]">
              <div className="p-4">
                <div className="relative mb-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search contacts..."
                    className="pl-8"
                  />
                </div>

                <ScrollArea className="h-[calc(100%-4rem)]">
                  <div className="space-y-2">
                    {conversations.map((contact) => (
                      <div
                        key={contact.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 cursor-pointer"
                      >
                        <Avatar>
                          <AvatarImage src={contact.participantAvatar} />
                          <AvatarFallback>
                            {contact.participantName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">
                            {contact.participantName}
                          </h4>
                          <Badge
                            variant="outline"
                            className="text-xs px-1 py-0"
                          >
                            {contact.participantRole === "healthcare"
                              ? "Doctor"
                              : contact.participantRole === "admin"
                                ? "Admin"
                                : "Patient"}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-auto">
                          Message
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagingPanel;
