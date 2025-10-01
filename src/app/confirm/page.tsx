"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, RefreshCw } from "lucide-react";
import { signUp } from "@/lib/supabase";
import toast from "react-hot-toast";
// import Link from "next/link"

export default function EmailConfirmation() {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const email = "YOUR@EMAIL.COM"
  const handleResend = async () => {
    // e.preventDefault();
    setIsResending(true);

    try {
      // const data;
      const data = await signUp(email, password); // Await sign-up
      if (data?.error) {
        console.error("Authentication error:", data?.error);
        // alert(`Error: ${data.error}`);
        toast.error(`Error: ${data.error}`, {
          duration: 4000,
          position: "bottom-center",

          // Styling
          style: { backgroundColor: "#fc5659" },
          className: "",

          // Custom Icon
          icon: "❌",

          // Change colors of success/error/loading icon
          iconTheme: {
            primary: "#99f598",
            secondary: "#99f598",
          },

          // Aria
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },

          // Additional Configuration
          removeDelay: 2000,
        });
      } else {
        // alert(isSignIn ? "Login successful!" : "Signup successful! Check your email.");
        toast.success("Email was resent! Check your email.", {
          duration: 4000,
          position: "bottom-center",

          // Styling
          style: { backgroundColor: "#99f598" },
          className: "",

          // Custom Icon
          icon: "👏",

          // Change colors of success/error/loading icon
          iconTheme: {
            primary: "#99f598",
            secondary: "#99f598",
          },

          // Aria
          ariaProps: {
            role: "status",
            "aria-live": "polite",
          },

          // Additional Configuration
          removeDelay: 2000,
        });
      }

      // Add your resend confirmation email logic here

      // Simulate API call
      setTimeout(() => {
        setIsResending(false);
        setResendSuccess(true);

        // Reset success message after 3 seconds
        setTimeout(() => setResendSuccess(false), 3000);
      }, 1500);
    } catch (error) {
      console.log(error);
      toast.error("An unexpected error occurred. Please try again.", {
        duration: 4000,
        position: "bottom-center",

        // Styling
        style: { backgroundColor: "#fc5659" },
        className: "",

        // Custom Icon
        icon: "❌",

        // Change colors of success/error/loading icon
        iconTheme: {
          primary: "#99f598",
          secondary: "#99f598",
        },

        // Aria
        ariaProps: {
          role: "status",
          "aria-live": "polite",
        },

        // Additional Configuration
        removeDelay: 2000,
      });
    }
  };
  useEffect(() => {
    const storedEmail = localStorage.getItem("signupEmail");
    const storedPassword = localStorage.getItem("signupPassword");
    if (storedEmail && storedPassword) {
      setEmail(storedEmail);
      setPassword(storedPassword);
      // Optional: Clear it after use
      localStorage.removeItem("signupEmail");
      localStorage.removeItem("signupPassword");
    }
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-yellow-400 p-4 text-center mb-2 transform -rotate-2">
        <h1 className="text-5xl font-bold tracking-tight text-purple-800 uppercase">
          VERIFY!
        </h1>
        <div className="text-xs uppercase tracking-widest text-purple-800 font-bold mt-1">
          ESTABLISHED 2025 • SPECIAL EDITION
        </div>
      </div>

      <div className="border-8 border-purple-800 bg-pink-100 p-6 transform rotate-1">
        <div className="bg-cyan-300 -m-2 p-4 mb-6 transform -rotate-1">
          <h2 className="text-2xl font-bold text-center uppercase tracking-widest text-purple-800">
            CHECK YOUR MAILBOX!
          </h2>
          <p className="text-center text-purple-800 font-bold">
            WE HAVE SENT YOU A SPECIAL INVITATION
          </p>
        </div>

        <div className="flex justify-center my-8">
          <div className="w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-purple-800 transform rotate-12">
            <Mail size={48} className="text-purple-800 transform -rotate-12" />
          </div>
        </div>

        <div className="bg-yellow-100 border-4 border-purple-800 p-4 text-center mb-6">
          <p className="text-purple-800 font-bold uppercase">
            WE HAVE SENT A CONFIRMATION TO:
          </p>
          <p className="text-xl font-bold text-purple-800 mt-2 break-all">
            {email}
          </p>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-purple-800 font-bold uppercase tracking-wide">
            CLICK THE LINK IN YOUR EMAIL TO
            <br />
            ACTIVATE YOUR SUBSCRIPTION!
          </p>

          <div className="border-t-4 border-b-4 border-dashed border-purple-800 py-4 my-6">
            <p className="text-purple-800 font-bold">
              {resendSuccess
                ? "NEW INVITATION SENT! CHECK YOUR MAILBOX!"
                : "DIDN'T RECEIVE OUR INVITATION?"}
            </p>
            <Button
              onClick={() => handleResend()}
              disabled={isResending}
              className="mt-2 bg-purple-800 hover:bg-purple-900 text-yellow-400 font-bold uppercase tracking-widest py-4 px-6 border-4 border-black transform hover:rotate-1 transition-transform"
            >
              {isResending ? (
                <span className="flex items-center">
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  SENDING...
                </span>
              ) : (
                "RESEND INVITATION!"
              )}
            </Button>
          </div>

          {/* <div className="text-purple-800 font-bold underline decoration-wavy decoration-pink-500 underline-offset-4 uppercase hover:text-purple-900">
          <Link href="/">BACK TO ACCESS PAGE</Link>
           
          </div> */}
        </div>

        <div className="mt-6 border-t-4 border-dashed border-purple-800 pt-4">
          <div className="text-xs text-center text-purple-800 font-bold uppercase tracking-widest">
            © 2025 RETRO MAGAZINE CORP • ALL RIGHTS RESERVED
          </div>
        </div>
      </div>
    </div>
  );
}
