"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RequestOtpSchema, VerifyOtpSchema, ForgotPasswordSchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import CardModal from "./cardwrapper";

interface ForgotPasswordFormProps {
  isOpen: boolean;
  onClose: () => void;
  openLoginModal: () => void;
}

const ForgotPasswordForm = ({ isOpen, onClose, openLoginModal }: ForgotPasswordFormProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("requestOtp");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const requestOtpForm = useForm<z.infer<typeof RequestOtpSchema>>({
    resolver: zodResolver(RequestOtpSchema),
    defaultValues: {
      email: "",
    },
  });

  const verifyOtpForm = useForm<z.infer<typeof VerifyOtpSchema>>({
    resolver: zodResolver(VerifyOtpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const resetPasswordForm = useForm<z.infer<typeof ForgotPasswordSchema>>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onRequestOtp = async (data: z.infer<typeof RequestOtpSchema>) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:4500/users/request-reset-otp`,
        { 
          email: data.email,
          purpose: 'reset'  // Add this line
        }
      );
      if (response.data.message) {
        setEmail(data.email);
        setStep("verifyOtp");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        alert("No account found with this email");
      } else {
        alert(error.response?.data.error || "Error sending OTP");
      }
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (data: z.infer<typeof VerifyOtpSchema>) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:4500/users/verify-otp`,
        {
          email: email,
          otp: data.otp,
          purpose: 'reset'  // Add this line
        }
      );
      if (response.data.message) {
        setOtp(data.otp);
        setStep("resetPassword");
      }
    } catch (error: any) {
      alert(error.response?.data.error || "Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data: z.infer<typeof ForgotPasswordSchema>) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:4500/users/reset-password`,
        {
          email: email,
          otp: otp,
          password: data.password,
        }
      );
      if (response.data.message) {
        alert(response.data.message);
        onClose();
        openLoginModal();
      }
    } catch (error: any) {
      alert(error.response?.data.error || "Error resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CardModal
      isOpen={isOpen}
      onClose={onClose}
      label="Reset your password"
      title="Forgot Password"
      openLoginModal={openLoginModal}
    >
      {step === "requestOtp" && (
        <Form {...requestOtpForm}>
          <form onSubmit={requestOtpForm.handleSubmit(onRequestOtp)} className="space-y-6">
            <FormField
              control={requestOtpForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="johndoe@example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Request OTP"}
            </Button>
          </form>
        </Form>
      )}
      {step === "verifyOtp" && (
        <Form {...verifyOtpForm}>
          <form onSubmit={verifyOtpForm.handleSubmit(onVerifyOtp)} className="space-y-6">
            <FormField
              control={verifyOtpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <Input {...field} type="text" placeholder="Enter OTP" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>
        </Form>
      )}
      {step === "resetPassword" && (
        <Form {...resetPasswordForm}>
          <form onSubmit={resetPasswordForm.handleSubmit(onResetPassword)} className="space-y-6">
            <FormField
              control={resetPasswordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Enter new password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={resetPasswordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder="Confirm new password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      )}
    </CardModal>
  );
};

export default ForgotPasswordForm;