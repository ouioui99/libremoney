import React from "react";
import { Modal, View, TouchableWithoutFeedback, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type Props = {
  visible: boolean;
  date: Date;
  onClose: () => void;
  onChange: (selectedDate: Date) => void;
};

export default function CalendarModal({
  visible,
  date,
  onClose,
  onChange,
}: Props) {
  const handleChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) onChange(selectedDate);
    onClose(); // 日付選択後に閉じる
  };

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 16,
                padding: 10,
                alignItems: "center",
              }}
            >
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={handleChange}
                textColor="black"
                style={{ width: "100%" }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
