// contexts/SnackbarContext.tsx
import React, { createContext, useContext, useState } from "react";

type SnackbarContextType = {
  visible: boolean;
  message: string;
  showSnackbar: (msg: string) => void;
  hideSnackbar: () => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(
  undefined,
);

export const SnackbarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const showSnackbar = (msg: string) => {
    setMessage(msg);
    setVisible(true);
  };

  const hideSnackbar = () => {
    setVisible(false);
  };

  return (
    <SnackbarContext.Provider
      value={{ visible, message, showSnackbar, hideSnackbar }}
    >
      {children}
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within SnackbarProvider");
  }
  return context;
};
