// src/components/CalendarModal.tsx
import React from "react";
import { Modal, View, TouchableWithoutFeedback } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";

// 日本語ロケールを定義
LocaleConfig.locales["jp"] = {
  monthNames: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  monthNamesShort: [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ],
  dayNames: [
    "日曜日",
    "月曜日",
    "火曜日",
    "水曜日",
    "木曜日",
    "金曜日",
    "土曜日",
  ],
  dayNamesShort: ["日", "月", "火", "水", "木", "金", "土"],
  today: "今日",
};

// デフォルトロケールを日本語に設定
LocaleConfig.defaultLocale = "jp";

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
  const { theme } = useTheme();
  const c = colors[theme];

  const formattedDate = date.toISOString().split("T")[0]; // YYYY-MM-DD

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
                backgroundColor: c.card,
                borderRadius: 16,
                padding: 10,
                width: "80%",
                maxWidth: 600,
              }}
            >
              <Calendar
                style={{ width: "100%" }}
                current={formattedDate}
                onDayPress={(day) => {
                  onChange(new Date(day.dateString));
                  onClose();
                }}
                markedDates={{
                  [formattedDate]: { selected: true, selectedColor: c.accent },
                }}
                theme={{
                  backgroundColor: c.background,
                  calendarBackground: c.card,
                  textSectionTitleColor: c.text,
                  dayTextColor: c.text,
                  monthTextColor: c.text,
                  arrowColor: c.accent,
                  todayTextColor: c.accent,
                  selectedDayBackgroundColor: c.accent,
                  selectedDayTextColor: c.background,
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
