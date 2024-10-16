"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { useState } from "react";
import { AlertCircle, LoaderCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
    email: z.string().min(1, "Email is required").email({ message: "Invalid email address" }),
    password: z.string().min(8, "Password requires at least 8 characters"), // Password has more criterias but we only let user know about length
})

export default function Login() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        let isErrorSet = false;
        // Placeholder for auth to user service
        try {
            await form.trigger();
            if (!form.formState.isValid) {
                return;
            }

            setIsLoading(true);

            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_AUTH_URL}/login`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            if (response.status == 400) {
                setError("Missing email or password.");
                isErrorSet = true;
                throw new Error("Missing email or password: " + response.statusText);
            } else if (response.status == 401) {
                setError("Incorrect email or password.");
                isErrorSet = true;
                throw new Error("Incorrect email or password: " + response.statusText);
            } else if (response.status == 403) {
                setError("Email not verified. Please verify your email before logging in.");
                isErrorSet = true;
                throw new Error("Email not verified: " + response.statusText);
            } else if (response.status == 500) {
                setError("Database or server error. Please try again.");
                isErrorSet = true;
                throw new Error("Database or server error: " + response.statusText);
            } else if (!response.ok) {
                setError("There was an error logging in. Please try again.");
                isErrorSet = true;
                throw new Error("Error logging in: " + response.statusText);
            }

            const responseData = await response.json();
            const { accessToken, id, username, email, isAdmin, ...other } = responseData.data;
            localStorage.setItem('token', accessToken);
            router.push("/question-repo");
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen w-screen px-10 items-center justify-center bg-white font-sans">
            <div className="mx-auto flex flex-col justify-center gap-6 w-[350px]">
                <div className="flex flex-col gap-2 text-left pb-1">
                    <span className="font-serif font-light text-4xl text-primary tracking-tight">
                        Sign in
                    </span>
                </div>
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Error</AlertTitle>
                        <AlertDescription>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}
                <div className="flex flex-col gap-4 text-black">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button 
                                type="submit" 
                                className="btn btn-primary w-full mt-2 disabled:opacity-80"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : (
                                    "Sign in"
                                )}
                            </Button>
                        </form>
                    </Form>
                    <div className="px-8 text-center text-sm">
                        Forgot your password?{" "}
                        <Link
                            href="/auth/forgot-password"
                            className="font-semibold hover:text-brand-700 transition-colors underline underline-offset-2"
                        >
                            Reset it
                        </Link>
                    </div>
                    <div className="px-8 text-center text-sm">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/auth/sign-up"
                            className="font-semibold hover:text-brand-700 transition-colors underline underline-offset-2"
                        >
                            Sign up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}