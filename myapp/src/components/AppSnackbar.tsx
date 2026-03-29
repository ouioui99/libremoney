// components/AppSnackbar.tsx
import React from "react";
import { Snackbar } from "react-native-paper";
import { useSnackbar } from "../contexts/SnackbarContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function AppSnackbar() {
  const { visible, message, hideSnackbar } = useSnackbar();
  const insets = useSafeAreaInsets();

  return (
    <Snackbar
      visible={visible}
      onDismiss={hideSnackbar}
      duration={3000}
      style={{
        marginBottom: insets.bottom + 20,
      }}
      action={{
        label: "閉じる",
        onPress: hideSnackbar,
      }}
    >
      {message}
    </Snackbar>
  );
}
