"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signUp } from "@/lib/supabase"
// import { useRouter } from "next/navigation"

export default function AuthForm() {
  // const router = useRouter()
  const [isSignIn, setIsSignIn] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      let data;
      if (isSignIn) {
        data = await signIn(email, password); // Await sign-in
        console.log("Signing in:", data);
        
      } else {
        data = await signUp(email, password); // Await sign-up
        console.log("Signing up:", data);
      }
  
      if (data?.error) {
        console.error("Authentication error:", data?.error);
        alert(`Error: ${data.error}`);
      } else {
        alert(isSignIn ? "Login successful!" : "Signup successful! Check your email.");
        if(isSignIn){
          window.location.href = "/admin/create"; // Redirect after success
        }else{
          window.location.href = "/confirm";
        }
        
        // router.push("/admin/create")
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-yellow-400 p-4 text-center mb-2 transform -rotate-2">
        <h1 className="text-5xl font-bold tracking-tight text-purple-800 uppercase">
          {isSignIn ? "ACCESS" : "SUBSCRIBE"}
        </h1>
        <div className="text-xs uppercase tracking-widest text-purple-800 font-bold mt-1">
          ESTABLISHED 1978 • ISSUE #42
        </div>
      </div>

      <form onSubmit={onSubmit} className="border-8 border-purple-800 bg-pink-100 p-6 transform rotate-1">
        <div className="bg-cyan-300 -m-2 p-4 mb-6 transform -rotate-1">
          <h2 className="text-2xl font-bold text-center uppercase tracking-widest text-purple-800">
            {isSignIn ? "READER ACCESS" : "NEW SUBSCRIPTION"}
          </h2>
          <p className="text-center text-purple-800 font-bold">
            {isSignIn ? "ENTER YOUR CREDENTIALS BELOW" : "FILL OUT THIS FORM TO JOIN"}
          </p>
        </div>

        <div className="space-y-6">
          {!isSignIn && (
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-purple-800 font-bold uppercase tracking-wider">
                YOUR NAME
              </Label>
              <Input
                id="name"
                placeholder="JOHN DOE"
                required={!isSignIn}
                disabled={isLoading}
                className="border-4 border-purple-800 bg-yellow-100 placeholder:text-purple-400 text-purple-800 font-bold"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="email" className="text-purple-800 font-bold uppercase tracking-wider">
              EMAIL ADDRESS
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="YOU@EXAMPLE.COM"
              required
              disabled={isLoading}
              className="border-4 border-purple-800 bg-yellow-100 placeholder:text-purple-400 text-purple-800 font-bold"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password" className="text-purple-800 font-bold uppercase tracking-wider">
              SECRET PASSWORD
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="border-4 border-purple-800 bg-yellow-100 text-purple-800 font-bold"
            />
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            type="submit"
            className="w-full bg-purple-800 hover:bg-purple-900 text-yellow-400 font-bold text-xl uppercase tracking-widest py-6 border-4 border-black transform hover:-rotate-1 transition-transform"
            disabled={isLoading}
          >
            {isLoading ? "PROCESSING..." : isSignIn ? "ENTER NOW!" : "SUBSCRIBE NOW!"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              className="text-purple-800 font-bold underline decoration-wavy decoration-pink-500 underline-offset-4 uppercase hover:text-purple-900"
              onClick={() => setIsSignIn(!isSignIn)}
              disabled={isLoading}
            >
              {isSignIn ? "NO SUBSCRIPTION? SIGN UP HERE!" : "ALREADY A READER? SIGN IN!"}
            </button>
          </div>
        </div>

        <div className="mt-6 border-t-4 border-dashed border-purple-800 pt-4">
          <div className="text-xs text-center text-purple-800 font-bold uppercase tracking-widest">
            © 1983 THE COMMIT LOG MAGAZINE CORP • ALL RIGHTS RESERVED
          </div>
        </div>
      </form>
    </div>
  )
}

