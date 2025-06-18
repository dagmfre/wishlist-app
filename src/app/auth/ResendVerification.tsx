"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ResendVerificationProps {
  email: string;
}

export default function ResendVerification({ email }: ResendVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClientComponentClient();

  const handleResend = async () => {
    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage("Failed to resend verification email. Please try again.");
      } else {
        setMessage("Verification email sent! Check your inbox.");
      }
    } catch (err) {
      console.error("Error resending verification:", err);
      setMessage("Failed to resend verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={handleResend}
        disabled={loading}
        className="btn-secondary"
      >
        {loading ? "Sending..." : "Resend Verification Email"}
      </button>
      {message && (
        <p
          className={`mt-2 text-sm ${
            message.includes("sent") ? "text-success-600" : "text-danger-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
