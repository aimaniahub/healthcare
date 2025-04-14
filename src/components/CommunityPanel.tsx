import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Flag,
  Filter,
  Search,
  Plus,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  category: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  upvotes: number;
  downvotes: number;
}

const CommunityPanel = ({
  userRole = "patient",
}: {
  userRole?: "patient" | "healthcare" | "admin";
}) => {
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newPostDialogOpen, setNewPostDialogOpen] = useState(false);

  // Mock data for posts
  const mockPosts: Post[] = [
    {
      id: "1",
      title: "Living with Type 2 Diabetes: My Journey",
      content:
        "I was diagnosed with Type 2 Diabetes last year and wanted to share my experience with managing it through diet and exercise...",
      author: {
        name: "Jane Smith",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=jane",
      },
      category: "Chronic Conditions",
      tags: ["diabetes", "lifestyle", "nutrition"],
      upvotes: 24,
      downvotes: 2,
      commentCount: 8,
      createdAt: "2023-06-15T14:30:00Z",
    },
    {
      id: "2",
      title: "Questions about COVID-19 Booster Shots",
      content:
        "I received my initial COVID-19 vaccines, but I'm unsure about when I should get a booster. Can anyone provide guidance?",
      author: {
        name: "Michael Johnson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
      },
      category: "Vaccines",
      tags: ["covid-19", "vaccines", "boosters"],
      upvotes: 15,
      downvotes: 1,
      commentCount: 12,
      createdAt: "2023-06-18T09:45:00Z",
    },
    {
      id: "3",
      title: "Tips for Managing Anxiety During Medical Procedures",
      content:
        "I struggle with anxiety during medical appointments. Here are some techniques that have helped me cope...",
      author: {
        name: "Sarah Williams",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
      },
      category: "Mental Health",
      tags: ["anxiety", "coping strategies", "medical procedures"],
      upvotes: 32,
      downvotes: 0,
      commentCount: 15,
      createdAt: "2023-06-20T16:15:00Z",
    },
  ];

  // Mock data for comments
  const mockComments: Comment[] = [
    {
      id: "1",
      content:
        "Thank you for sharing your experience. I was recently diagnosed and found your tips very helpful.",
      author: {
        name: "Robert Chen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
      },
      createdAt: "2023-06-16T10:20:00Z",
      upvotes: 5,
      downvotes: 0,
    },
    {
      id: "2",
      content:
        "Have you tried the Mediterranean diet? It's been shown to help with blood sugar management.",
      author: {
        name: "Dr. Emily Parker",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily",
      },
      createdAt: "2023-06-16T14:45:00Z",
      upvotes: 8,
      downvotes: 0,
    },
    {
      id: "3",
      content:
        "I've been living with diabetes for 10 years now. It gets easier with time as you learn what works for your body.",
      author: {
        name: "Thomas Wilson",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=thomas",
      },
      createdAt: "2023-06-17T09:30:00Z",
      upvotes: 6,
      downvotes: 1,
    },
  ];

  // Categories for filtering
  const categories = [
    "All Topics",
    "Chronic Conditions",
    "Vaccines",
    "Mental Health",
    "Nutrition",
    "Exercise",
    "Medications",
    "Preventive Care",
  ];

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setActiveTab("view-post");
  };

  const handleBackToBrowse = () => {
    setSelectedPost(null);
    setActiveTab("browse");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full h-full bg-background p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Community Forums</h1>
        <div className="flex gap-2">
          {userRole === "admin" && (
            <Button variant="outline">
              <Flag className="mr-2 h-4 w-4" />
              Moderation Queue
            </Button>
          )}
          <Button onClick={() => setNewPostDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="browse">Browse Topics</TabsTrigger>
          <TabsTrigger value="my-posts">My Posts</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          {selectedPost && (
            <TabsTrigger value="view-post">View Post</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/4">
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <Button
                        key={category}
                        variant="ghost"
                        className="w-full justify-start"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="w-3/4">
              <div className="flex gap-2 mb-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search topics..." className="pl-8" />
                </div>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
              </div>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {mockPosts.map((post) => (
                    <Card
                      key={post.id}
                      className="cursor-pointer hover:bg-accent/10"
                      onClick={() => handlePostClick(post)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <div>
                            <CardTitle>{post.title}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>
                                  {post.author.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              {post.author.name} • {formatDate(post.createdAt)}
                            </CardDescription>
                          </div>
                          <Badge>{post.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2">{post.content}</p>
                        <div className="flex gap-1 mt-2">
                          {post.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {post.upvotes}
                          </div>
                          <div className="flex items-center">
                            <ThumbsDown className="h-4 w-4 mr-1" />
                            {post.downvotes}
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.commentCount}
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-posts">
          <Card>
            <CardHeader>
              <CardTitle>My Posts</CardTitle>
              <CardDescription>
                Posts you've created in the community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                You haven't created any posts yet.
              </p>
              <div className="flex justify-center">
                <Button onClick={() => setNewPostDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Posts</CardTitle>
              <CardDescription>
                Posts you've saved for later reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">
                You haven't saved any posts yet.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="view-post">
          {selectedPost && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={handleBackToBrowse}
                className="mb-2"
              >
                ← Back to Topics
              </Button>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">
                        {selectedPost.title}
                      </CardTitle>
                      <CardDescription className="flex items-center mt-2">
                        <Avatar className="h-6 w-6 mr-2">
                          <AvatarImage src={selectedPost.author.avatar} />
                          <AvatarFallback>
                            {selectedPost.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedPost.author.name} •{" "}
                        {formatDate(selectedPost.createdAt)}
                      </CardDescription>
                    </div>
                    <Badge>{selectedPost.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line mb-4">
                    {selectedPost.content}
                  </p>
                  <div className="flex gap-1 mb-4">
                    {selectedPost.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Upvote ({selectedPost.upvotes})
                    </Button>
                    <Button variant="outline" size="sm">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Downvote ({selectedPost.downvotes})
                    </Button>
                    {userRole === "admin" && (
                      <Button variant="outline" size="sm" className="ml-auto">
                        <Flag className="h-4 w-4 mr-1" />
                        Moderate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Comments ({mockComments.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="mb-6">
                    <Textarea
                      placeholder="Add your comment..."
                      className="mb-2"
                    />
                    <Button>Post Comment</Button>
                  </div>

                  <Separator />

                  {mockComments.map((comment) => (
                    <div key={comment.id} className="py-4">
                      <div className="flex items-start gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.author.avatar} />
                          <AvatarFallback>
                            {comment.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="font-medium">{comment.author.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                          <p className="mt-1">{comment.content}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                            >
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {comment.upvotes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                            >
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              {comment.downvotes}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                            >
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={newPostDialogOpen} onOpenChange={setNewPostDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Share your thoughts, questions, or experiences with the community.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="post-title" className="text-sm font-medium">
                Title
              </label>
              <Input id="post-title" placeholder="Enter a descriptive title" />
            </div>
            <div className="space-y-2">
              <label htmlFor="post-category" className="text-sm font-medium">
                Category
              </label>
              <select
                id="post-category"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {categories
                  .filter((c) => c !== "All Topics")
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="post-content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="post-content"
                placeholder="Share your thoughts..."
                className="min-h-[150px]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="post-tags" className="text-sm font-medium">
                Tags (comma separated)
              </label>
              <Input
                id="post-tags"
                placeholder="diabetes, nutrition, lifestyle"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewPostDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setNewPostDialogOpen(false)}>Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunityPanel;
