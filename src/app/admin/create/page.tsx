"use client";

import type React from "react";
// import adminError from "@/public/adminOnly.png";
import adminError from "./adminOnly.png";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/tag-input";
import { NewspaperHeader } from "@/components/newspaper-header";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import ImageUpload from "@/components/image-upload";
import MarkdownEditor from "@/components/MarkdownEditor";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";

export default function CreateBlogPost() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      console.log("USER DATA", user);
      if (!user) {
        toast.error("Please log in to add a blog post.", {
          duration: 4000,
          position: "bottom-center",
          style: { backgroundColor: "#fc5659" },
          icon: "❌",
        });
        router.push("/signup");
        return;
      } else {
        setAuthor(user.user_metadata.name);
      }

      if (user.email === "gnyagura57@gmail.com") {
        setIsAdmin(true);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!title || !author || !category || !excerpt || !content) {
      toast.error("Please fill in all required fields", {
        duration: 4000,
        position: "bottom-center",
        style: { backgroundColor: "#fc5659" },
        icon: "❌",
      });
      setIsSubmitting(false);
      return;
    }

    const newPost = {
      title: title.trim(),
      author: author.trim(),
      category: category,
      imageURL: imageURL || "",
      tags: tags,
      excerpt: excerpt.trim(),
      content: content,
      subtitle: subtitle.trim() || title, // Fallback to title if subtitle is empty
      published: true, // Set to true for published posts
      views: 0, // Initialize views
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("NEWPOST", newPost);

    const { data, error } = await supabase
      .from("blogPosts")
      .insert([newPost])
      .select();

    if (data && !error) {
      toast.success("Post published successfully! 🎉", {
        duration: 4000,
        position: "bottom-center",
        style: { backgroundColor: "#99f598" },
        icon: "👏",
      });

      // Reset form
      setTitle("");
      setAuthor("");
      setCategory("");
      setImageURL("");
      setTags([]);
      setExcerpt("");
      setContent("");
      setSubtitle("");

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } else {
      console.error("Error adding post:", error);
      toast.error(`Error adding post: ${error?.message || "Unknown error"}`, {
        duration: 4000,
        position: "bottom-center",
        style: { backgroundColor: "#fc5659" },
        icon: "❌",
      });
    }

    setIsSubmitting(false);
  };

  const handleMarkdownContent = (markdown: string) => {
    setContent(markdown);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 bg-[#f9f7f1]">
      <NewspaperHeader />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 font-serif uppercase border-b-2 border-black pb-2">
          Submit New Article
        </h1>
        <Button
          variant="ghost"
          asChild
          className="mb-6 rounded-none border border-black hover:bg-gray-100"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Front Page
          </Link>
        </Button>

        {isAdmin ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-serif text-lg">
                Headline (Title) *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter headline in ALL CAPS for newspaper style"
                className="font-serif rounded-none border-black"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle" className="font-serif text-lg">
                Subheadline
              </Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="A supporting headline that provides additional context"
                className="font-serif rounded-none border-black"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt" className="font-serif text-lg">
                Excerpt (Lede) *
              </Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="The opening paragraph that summarizes the article"
                className="font-serif rounded-none border-black min-h-[100px]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" className="font-serif text-lg">
                Author *
              </Label>
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder={author}
                className="font-serif rounded-none border-black"
                required
              />
            </div>

            <ImageUpload onUpload={setImageURL} />

            {imageURL && (
              <div className="mt-2">
                <Image
                  src={imageURL}
                  alt="Preview"
                  width={200}
                  height={150}
                  className="object-cover border-2 border-black"
                />
                <button
                  type="button"
                  onClick={() => setImageURL("")}
                  className="text-red-500 text-sm mt-1 hover:underline"
                >
                  Remove image
                </button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="content" className="font-serif text-lg">
                Article Content *
              </Label>
              <MarkdownEditor onContentChange={handleMarkdownContent} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="font-serif text-lg">
                  Section *
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="font-serif rounded-none border-black">
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent className="font-serif rounded-none">
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="politics">Politics</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="arts">Arts & Culture</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="opinion">Opinion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-serif text-lg">Tags</Label>
                <TagInput
                  tags={tags}
                  setTags={setTags}
                  className="rounded-none border-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/")}
                className="rounded-none border-black"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="rounded-none bg-black text-white hover:bg-gray-800"
              >
                {isSubmitting ? "Publishing..." : "Publish Article"}
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div className="w-full max-w-3xl mx-auto py-6 flex flex-col items-center">
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                <span className="text-amber-500 text-lg leading-none mt-0.5">
                  ✦
                </span>
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Publishing is currently limited</p>
                  <p className="text-amber-700">
                    Only administrators can publish articles right now.
                    We&apos;re working on opening this up soon — thanks for your
                    patience!
                  </p>
                </div>
              </div>
              <img
                src={adminError.src}
                alt=""
                width={400}
                height={200}
                className="w-[400px] h-auto grayscale hover:grayscale-0 transition-all duration-300 animate-pulse"
              />
            </div>
          </>
        )}
        <Toaster />
      </div>
    </div>
  );
}
