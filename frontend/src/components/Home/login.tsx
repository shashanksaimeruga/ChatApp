"use client";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { LoginSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import userInfo from "@/hooks/userInfo";
import CardModal from "./cardwrapper";
import ProfilePrompt from "./profile-prompt";

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  openRegisterModal: () => void;
  openForgotPasswordModal: () => void;
}

const LoginForm = ({ isOpen, onClose, openRegisterModal, openForgotPasswordModal }: LoginFormProps) => {
  const setUsername = userInfo((state) => state.setusername);
  const [loading, setLoading] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      usernameOrEmail: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof LoginSchema>) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:4500/users/login`,
        {
          username: data.usernameOrEmail,
          password: data.password,
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response.data.username) {
        localStorage.setItem("username", response.data.username);
        localStorage.setItem("userId", response.data._id); // Add this line
        setUsername(response.data.username);
        if (!response.data.hasSeenProfilePrompt) {
          setShowProfilePrompt(true);
        } else {
          window.location.href = "/chat";
        }
      } else {
        alert(response.data.error);
      }
    } catch (error: any) {
      alert(error.response?.data.error || "An error occurred");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardModal
      isOpen={isOpen}
      onClose={onClose}
      label="Login to your account"
      title="Login"
      openRegisterModal={openRegisterModal}
      openForgotPasswordModal={openForgotPasswordModal}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="usernameOrEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username or Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      placeholder="Enter your username or email"
                    />
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
                    <Input {...field} type="password" placeholder="Enter your password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </Button>
        </form>
      </Form>
      {showProfilePrompt && <ProfilePrompt />}
    </CardModal>
  );
};

export default LoginForm;
