// "use client";

// import type React from "react";
// import { useState, useRef, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import {
//   MessageSquare,
//   Send,
//   Loader2,
//   User,
//   Bot,
//   Plus,
//   Trash2,
//   MoreVertical,
// } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// interface Message {
//   id: string;
//   role: "user" | "assistant";
//   content: string;
//   timestamp: Date;
// }

// interface Chat {
//   id: string;
//   name: string;
//   messages: Message[];
//   createdAt: Date;
// }

// interface ChatInterfaceProps {
//   isApiKeyValid: boolean;
//   apiKey: string;
//   currentChatId: string;
//   setCurrentChatId: (id: string) => void;
// }

// export function ChatInterface({
//   isApiKeyValid,
//   apiKey,
//   currentChatId,
//   setCurrentChatId,
// }: ChatInterfaceProps) {
//   const [chats, setChats] = useState<Chat[]>([]);
//   const [inputValue, setInputValue] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const scrollAreaRef = useRef<HTMLDivElement>(null);
//   const { toast } = useToast();

//   useEffect(() => {
//     const savedChats = localStorage.getItem("rag-chats");
//     if (savedChats) {
//       const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
//         ...chat,
//         createdAt: new Date(chat.createdAt),
//         messages: chat.messages.map((msg: any) => ({
//           ...msg,
//           timestamp: new Date(msg.timestamp),
//         })),
//       }));
//       setChats(parsedChats);
//     } else {
//       // Create default chat
//       const defaultChat: Chat = {
//         id: "default",
//         name: "New Chat",
//         messages: [],
//         createdAt: new Date(),
//       };
//       setChats([defaultChat]);
//     }
//   }, []);

//   useEffect(() => {
//     if (chats.length > 0) {
//       localStorage.setItem("rag-chats", JSON.stringify(chats));
//     }
//   }, [chats]);

//   const currentChat =
//     chats.find((chat) => chat.id === currentChatId) || chats[0];

//   const scrollToBottom = () => {
//     if (scrollAreaRef.current) {
//       const scrollElement = scrollAreaRef.current.querySelector(
//         "[data-radix-scroll-area-viewport]"
//       );
//       if (scrollElement) {
//         scrollElement.scrollTo({
//           top: scrollElement.scrollHeight,
//           behavior: "smooth",
//         });
//       }
//     }
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [currentChat?.messages]);

//   const createNewChat = () => {
//     const newChat: Chat = {
//       id: Date.now().toString(),
//       name: `Chat ${chats.length + 1}`,
//       messages: [],
//       createdAt: new Date(),
//     };
//     setChats((prev) => [...prev, newChat]);
//     setCurrentChatId(newChat.id);
//     toast({
//       title: "New Chat Created",
//       description: "Started a new conversation",
//     });
//   };

//   const deleteChat = (chatId: string) => {
//     if (chats.length === 1) {
//       toast({
//         title: "Cannot Delete",
//         description: "You must have at least one chat",
//         variant: "destructive",
//       });
//       return;
//     }

//     setChats((prev) => prev.filter((chat) => chat.id !== chatId));
//     if (currentChatId === chatId) {
//       const remainingChats = chats.filter((chat) => chat.id !== chatId);
//       setCurrentChatId(remainingChats[0].id);
//     }
//     toast({
//       title: "Chat Deleted",
//       description: "Chat has been removed",
//     });
//   };

//   const clearChatHistory = () => {
//     setChats((prev) =>
//       prev.map((chat) =>
//         chat.id === currentChatId ? { ...chat, messages: [] } : chat
//       )
//     );
//     toast({
//       title: "Chat Cleared",
//       description: "All messages have been removed from this chat",
//     });
//   };

//   const handleSendMessage = async () => {
//     if (!inputValue.trim() || !isApiKeyValid) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       role: "user",
//       content: inputValue,
//       timestamp: new Date(),
//     };

//     setChats((prev) =>
//       prev.map((chat) =>
//         chat.id === currentChatId
//           ? { ...chat, messages: [...chat.messages, userMessage] }
//           : chat
//       )
//     );

//     setInputValue("");
//     setIsLoading(true);

//     try {
//       const response = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           query: inputValue,
//           apiKey: apiKey,
//         }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const assistantMessage: Message = {
//           id: (Date.now() + 1).toString(),
//           role: "assistant",
//           content: data.response,
//           timestamp: new Date(),
//         };

//         setChats((prev) =>
//           prev.map((chat) =>
//             chat.id === currentChatId
//               ? { ...chat, messages: [...chat.messages, assistantMessage] }
//               : chat
//           )
//         );
//       } else {
//         throw new Error("Failed to get response");
//       }
//     } catch (error) {
//       toast({
//         title: "Error",
//         description: "Failed to get response. Please try again.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <Card className="h-screen flex flex-col overflow-auto">
//       <CardHeader className="sticky top-0 z-10 bg-background">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <MessageSquare className="h-5 w-5" />
//             <div>
//               <CardTitle className="text-lg">Chat with your Data</CardTitle>
//               <CardDescription className="text-xs">
//                 {currentChat?.name || "New Chat"}
//               </CardDescription>
//             </div>
//           </div>

//           <div className="flex items-center gap-2">
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="sm">
//                   <MoreVertical className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuItem onClick={clearChatHistory}>
//                   <Trash2 className="h-4 w-4 mr-2" />
//                   Clear History
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>
//       </CardHeader>

//       <CardContent className="flex-1 flex flex-col space-y-4 p-4">
//         <ScrollArea className="flex-1 pr-2" ref={scrollAreaRef}>
//           <div className="space-y-4">
//             {!currentChat?.messages.length ? (
//               <div className="text-center text-muted-foreground py-8">
//                 <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                 <p className="text-sm">
//                   Start a conversation by asking a question about your data
//                 </p>
//               </div>
//             ) : (
//               currentChat.messages.map((message) => (
//                 <div
//                   key={message.id}
//                   className={`flex gap-2 ${
//                     message.role === "user" ? "justify-end" : "justify-start"
//                   }`}
//                 >
//                   <div
//                     className={`flex gap-2 max-w-[85%] ${
//                       message.role === "user" ? "flex-row-reverse" : "flex-row"
//                     }`}
//                   >
//                     <div className="flex-shrink-0">
//                       {message.role === "user" ? (
//                         <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
//                           <User className="h-3 w-3 text-primary-foreground" />
//                         </div>
//                       ) : (
//                         <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center">
//                           <Bot className="h-3 w-3" />
//                         </div>
//                       )}
//                     </div>
//                     <div
//                       className={`p-3 rounded-lg ${
//                         message.role === "user"
//                           ? "bg-primary text-primary-foreground"
//                           : "bg-muted"
//                       }`}
//                     >
//                       <p className="text-sm whitespace-pre-wrap break-words">
//                         {message.content}
//                       </p>
//                       <p className="text-xs opacity-70 mt-1">
//                         {message.timestamp.toLocaleTimeString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//             {isLoading && (
//               <div className="flex gap-2 justify-start">
//                 <div className="flex gap-2">
//                   <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center">
//                     <Bot className="h-3 w-3" />
//                   </div>
//                   <div className="p-3 rounded-lg bg-muted">
//                     <Loader2 className="h-4 w-4 animate-spin" />
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </ScrollArea>

//         <div className="flex gap-2 sticky bottom-0 bg-background">
//           <Input
//             placeholder="Ask a question about your data..."
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onKeyPress={handleKeyPress}
//             disabled={!isApiKeyValid || isLoading}
//             className="flex-1 text-sm"
//           />
//           <Button
//             onClick={handleSendMessage}
//             disabled={!isApiKeyValid || !inputValue.trim() || isLoading}
//             size="icon"
//             className="shrink-0"
//           >
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>

//         {!isApiKeyValid && (
//           <p className="text-xs text-muted-foreground text-center">
//             Please enter a valid OpenAI API key to start chatting
//           </p>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  Send,
  Loader2,
  User,
  Bot,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
}

interface ChatInterfaceProps {
  isApiKeyValid: boolean;
  apiKey: string;
  currentChatId: string;
  setCurrentChatId: (id: string) => void;
}

export function ChatInterface({
  isApiKeyValid,
  apiKey,
  currentChatId,
  setCurrentChatId,
}: ChatInterfaceProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedChats = localStorage.getItem("rag-chats");
    if (savedChats) {
      const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        messages: chat.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
      setChats(parsedChats);
    } else {
      // Create default chat
      const defaultChat: Chat = {
        id: "default",
        name: "New Chat",
        messages: [],
        createdAt: new Date(),
      };
      setChats([defaultChat]);
    }
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("rag-chats", JSON.stringify(chats));
    }
  }, [chats]);

  const currentChat =
    chats.find((chat) => chat.id === currentChatId) || chats[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages, isLoading]);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      name: `Chat ${chats.length + 1}`,
      messages: [],
      createdAt: new Date(),
    };
    setChats((prev) => [...prev, newChat]);
    setCurrentChatId(newChat.id);
    toast({
      title: "New Chat Created",
      description: "Started a new conversation",
    });
  };

  const deleteChat = (chatId: string) => {
    if (chats.length === 1) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least one chat",
        variant: "destructive",
      });
      return;
    }

    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      setCurrentChatId(remainingChats[0].id);
    }
    toast({
      title: "Chat Deleted",
      description: "Chat has been removed",
    });
  };

  const clearChatHistory = () => {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId ? { ...chat, messages: [] } : chat
      )
    );
    toast({
      title: "Chat Cleared",
      description: "All messages have been removed from this chat",
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isApiKeyValid) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === currentChatId
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: inputValue,
          apiKey: apiKey,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
        };

        setChats((prev) =>
          prev.map((chat) =>
            chat.id === currentChatId
              ? { ...chat, messages: [...chat.messages, assistantMessage] }
              : chat
          )
        );
      } else {
        throw new Error("Failed to get response");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] max-h-[800px] bg-background border rounded-lg overflow-hidden">
      <div className="flex-shrink-0 p-4 border-b bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Chat with your Data</h3>
              <p className="text-sm text-muted-foreground">
                {currentChat?.name || "New Chat"}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={clearChatHistory}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear History
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900/20">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 space-y-4">
            {!currentChat?.messages.length ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Start a conversation by asking a question about your data
                </p>
              </div>
            ) : (
              <>
                {currentChat.messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[75%] ${
                        message.role === "user"
                          ? "flex-row-reverse"
                          : "flex-row"
                      }`}
                    >
                      <div className="flex-shrink-0 mb-1">
                        {message.role === "user" ? (
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-primary-foreground" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div
                        className={`relative px-4 py-2 rounded-2xl shadow-sm ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-white dark:bg-gray-800 border rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            message.role === "user"
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-end gap-2">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mb-1">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="bg-white dark:bg-gray-800 border px-4 py-2 rounded-2xl rounded-bl-md">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-shrink-0 p-4 border-t bg-card">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <Input
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isApiKeyValid || isLoading}
              className="pr-12 py-3 rounded-full border-2 focus:border-primary resize-none"
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!isApiKeyValid || !inputValue.trim() || isLoading}
            size="icon"
            className="rounded-full w-12 h-12 bg-primary hover:bg-primary/90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        {!isApiKeyValid && (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Please enter a valid OpenAI API key to start chatting
          </p>
        )}
      </div>
    </div>
  );
}
