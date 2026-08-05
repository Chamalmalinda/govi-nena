"use client";

import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={10}
      containerStyle={{
        top: 18,
        left: 16,
        right: 16,
      }}
      toastOptions={{
        duration: 3500,

        style: {
          maxWidth: "420px",
          background: "#FFFFFF",
          color: "#1B5E20",
          border: "1px solid #E0E0E0",
          borderRadius: "14px",
          padding: "12px 16px",
          fontSize: "14px",
          fontWeight: "600",
          boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
        },

        success: {
          iconTheme: {
            primary: "#4CAF50",
            secondary: "#FFFFFF",
          },
        },

        error: {
          duration: 4500,

          style: {
            background: "#FFF5F5",
            color: "#B71C1C",
            border: "1px solid #EF9A9A",
          },

          iconTheme: {
            primary: "#D32F2F",
            secondary: "#FFFFFF",
          },
        },

        loading: {
          style: {
            background: "#F9FBF7",
            color: "#1B5E20",
            border: "1px solid #C8E6C9",
          },
        },
      }}
    />
  );
}