"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const registered = searchParams.get("registered") === "true"
  const needsConfirm = searchParams.get("confirm") === "true"
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"

  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [emailInput, setEmailInput] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  function getLoginErrorMessage(message: string | undefined) {
    const normalized = (message ?? "").toLowerCase()

    if (normalized.includes("email not confirmed")) {
      return "Your email is not confirmed yet. Confirm your email, then sign in."
    }
    if (normalized.includes("invalid login credentials")) {
      return "Invalid email or password. If you just registered, confirm your email first."
    }

    return message ?? "Something went wrong. Please try again."
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(getLoginErrorMessage(error.message))
        return
      }
      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleResendConfirmation() {
    if (!emailInput) {
      setError("Enter your email first, then resend confirmation.")
      return
    }

    setError(null)
    setInfo(null)
    setResending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailInput,
      })
      if (error) {
        setError(error.message ?? "Could not resend confirmation email.")
        return
      }
      setInfo("Confirmation email sent. Please check your inbox.")
    } catch {
      setError("Could not resend confirmation email.")
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">P</span>
            </div>
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your PeopleDesk account
          </p>
        </div>
        <Card className="border-border bg-white">
          <CardHeader className="sr-only">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {registered && (
              <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                Account created!
                {needsConfirm ? " Please confirm your email, then sign in." : " Please sign in."}
              </div>
            )}
            {info && (
              <div className="mb-4 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {info}
              </div>
            )}
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com.au"
                  autoComplete="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit" className="mt-2 w-full" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleResendConfirmation}
                disabled={resending}
              >
                {resending ? "Sending confirmation…" : "Resend confirmation email"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh items-center justify-center bg-slate-50">
        <div className="text-sm text-muted-foreground">Loading…</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
