"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  };

  const formVariants = {
    signIn: { opacity: 1, x: 0, display: "flex" },
    signUp: { opacity: 1, x: 0, display: "flex" },
  };

  return (
    <div className="min-h-screen flex items-center justify-center container">
      <motion.div
        className="card"
        style={{
          maxWidth: "28rem",
          width: "100%",
          padding: "2rem",
        }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="stack"
          style={{ gap: "0.75rem", marginBottom: "2rem" }}
          variants={itemVariants}
        >
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 600,
              color: "var(--foreground)",
              letterSpacing: "-0.025em",
            }}
          >
            {flow === "signIn" ? "Sign in to access DOPE DB Admin" : "Create account"}
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Agent workflows for DOPE data analysis
          </p>
        </motion.div>

        {/* Form */}
        <form
          className="stack"
          style={{ gap: "1rem" }}
          onSubmit={(e) => {
            e.preventDefault();
            setIsLoading(true);
            const formData = new FormData(e.target as HTMLFormElement);
            formData.set("flow", flow);
            void signIn("password", formData)
              .catch((error) => {
                setError(error.message);
                setIsLoading(false);
              })
              .then(() => {
                router.push("/");
              });
          }}
        >
          {/* Name Input - Only show for sign up */}
          {flow === "signUp" && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <label
                htmlFor="name"
                style={{
                  display: "block",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  color: "var(--foreground)",
                  marginBottom: "0.5rem",
                }}
              >
                Name
              </label>
              <input
                className="w-full"
                style={{
                  padding: "0.75rem",
                  fontSize: "0.875rem",
                }}
                id="name"
                type="text"
                name="name"
                placeholder="Your full name"
                required
                disabled={isLoading}
              />
            </motion.div>
          )}

          {/* Email Input */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--foreground)",
                marginBottom: "0.5rem",
              }}
            >
              Email
            </label>
            <input
              className="w-full"
              style={{
                padding: "0.75rem",
                fontSize: "0.875rem",
              }}
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </motion.div>

          {/* Password Input */}
          <motion.div variants={itemVariants}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "var(--foreground)",
                marginBottom: "0.5rem",
              }}
            >
              Password
            </label>
            <input
              className="w-full"
              style={{
                padding: "0.75rem",
                fontSize: "0.875rem",
              }}
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  borderRadius: "calc(var(--radius) - 0.125rem)",
                  padding: "0.75rem",
                }}
              >
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                >
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              marginTop: "0.5rem",
              padding: "0.75rem",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
            type="submit"
            disabled={isLoading}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading
              ? "Please wait..."
              : flow === "signIn"
              ? "Sign in"
              : "Sign up"}
          </motion.button>

          {/* Flow Toggle */}
          <motion.div
            className="row"
            style={{
              justifyContent: "center",
              gap: "0.5rem",
              fontSize: "0.8125rem",
              marginTop: "0.5rem",
            }}
            variants={itemVariants}
          >
            <span style={{ color: "var(--muted)" }}>
              {flow === "signIn"
                ? "Don't have an account?"
                : "Already have an account?"}
            </span>
            <button
              type="button"
              onClick={() => {
                setFlow(flow === "signIn" ? "signUp" : "signIn");
                setError(null);
              }}
              disabled={isLoading}
              style={{
                color: "var(--accent)",
                fontWeight: 600,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              {flow === "signIn" ? "Sign up" : "Sign in"}
            </button>
          </motion.div>
        </form>

        {/* Footer */}
        <motion.div
          className="row"
          style={{
            justifyContent: "center",
            marginTop: "2rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--border)",
          }}
          variants={itemVariants}
        >
          <p style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
            Database Admin Agent
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
