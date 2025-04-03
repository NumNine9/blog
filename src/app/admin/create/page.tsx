"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TagInput } from "@/components/tag-input"
import { NewspaperHeader } from "@/components/newspaper-header"
import { BlogPost, supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"

export default function CreateBlogPost() {
  const router = useRouter()
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<User>();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const checkUser = async () => {
        const { data } = await supabase.auth.getUser();
        if (data?.user) {
          setUser(data.user);
        }else{
          console.error("User is not logged in.");
          alert("Please log in to add a blog post.");
          return;
        }
        setLoading(false);
      };
  
      checkUser();
    }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // setImage
    // In a real app, you would send this data to your API
    const newPost: BlogPost = {
      title: title,
      author: author,
      category: category,
      imageURL: imageURL,
      tags: tags,
      excerpt: excerpt,
      content: content,
      subtitle: subtitle,
      // created_at: new Date().toISOString(), // Optional, Supabase can auto-generate this
    };
    console.log(newPost)

    // Simulate API call
    // await new Promise((resolve) => setTimeout(resolve, 1000))
    // const result = await addBlogPost(newPost);
    // try{
    //   // const { data, error } = 
    //   await supabase.from('blogPosts').insert([newPost]).select()
    //   alert("Post added successfully!");
    //   router.push("/")
    // }catch(err){
    //   alert("Error adding post!");
    //   console.log(err)
    // }
    const { data, error } = await supabase.from('blogPosts').insert([newPost]).select()
        
    if (data) {
      alert("Post added successfully!");
      // Reset form
      setTitle("");
      setAuthor("");
      setCategory("");
      setImageURL("");
      setTags([]);
      setExcerpt("");
      setContent("");
      setSubtitle("");
    } else {
      alert("Error adding post!");
      console.log(error)
    }

    setIsSubmitting(false)
    // router.push("/")
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 bg-[#f9f7f1]">
      <NewspaperHeader />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 font-serif uppercase border-b-2 border-black pb-2">
          Submit New Article
        </h1>
        <h1 className="text-3xl font-bold mb-8 font-serif uppercase border-b-2 border-black pb-2">
          {user?.email}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="font-serif text-lg">
              Headline (Title)
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
              Excerpt (Lede)
            </Label>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="The opening paragraph that summarizes the article"
              className="font-serif rounded-none border-black"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="author" className="font-serif text-lg">
              Author
            </Label>
            <Textarea
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Enter author name"
              className="font-serif rounded-none border-black"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="font-serif text-lg">
              Article Content
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your article content here. HTML formatting is supported."
              className="min-h-[300px] font-serif rounded-none border-black"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="font-serif text-lg">
                Section
              </Label>
              <Select value={category} onValueChange={setCategory}>
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
              <TagInput tags={tags} setTags={setTags} className="rounded-none border-black" />
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
              disabled={isSubmitting}
              className="rounded-none bg-black text-white hover:bg-gray-800"
            >
              {isSubmitting || loading ? "Publishing..." : "Publish Article"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

