// components/CategoryModal.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { colors } from "../theme/colors";
import { Category, NewCategoryInput } from "../types/models";

// Ionicons の全アイコン名を取得
const allIoniconNames = Object.keys(Ionicons.glyphMap);
const outlineIcons = allIoniconNames.filter((name) =>
  name.endsWith("-outline")
);

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (category: NewCategoryInput | Category) => void;
  initialCategory?: Category;
  type: "expense" | "income";
}

const CategoryEditModal: React.FC<CategoryModalProps> = ({
  visible,
  onClose,
  onSave,
  initialCategory,
  type,
}) => {
  const { theme } = useTheme();
  const c = colors[theme];

  const [selectedIcon, setSelectedIcon] = useState("");
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (initialCategory) {
      setSelectedIcon(initialCategory.icon);
      setName(initialCategory.name);
    } else {
      setSelectedIcon("");
      setName("");
    }
  }, [initialCategory, visible]);

  // 検索機能
  const filteredIcons = useMemo(() => {
    return outlineIcons.filter((icon) => icon.includes(search.toLowerCase()));
  }, [search]);

  const handleSave = () => {
    if (!name.trim() || !selectedIcon) return;
    if (initialCategory) {
      onSave({
        ...initialCategory,
        icon: selectedIcon,
        name: name.trim(),
        type: type,
      });
    } else {
      onSave({ icon: selectedIcon, name: name.trim(), type: type });
    }

    setName("");
    setSelectedIcon("");
    setSearch("");
    onClose();
  };

  const handleCancel = () => {
    setName("");
    setSelectedIcon("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      presentationStyle="overFullScreen"
    >
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={"padding"}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.4)" }]}
          >
            <View style={[styles.container, { backgroundColor: c.background }]}>
              <Text style={[styles.title, { color: c.text }]}>
                {type === "income"
                  ? "収入カテゴリーを追加"
                  : "支出カテゴリーを追加"}
              </Text>

              {/* アイコン選択 */}
              <Text style={[styles.label, { color: c.text }]}>
                アイコンを選択
              </Text>
              <FlatList
                data={filteredIcons}
                numColumns={6}
                keyExtractor={(item) => item}
                showsVerticalScrollIndicator={true}
                style={{ maxHeight: 240, marginBottom: 10 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.iconButton,
                      {
                        backgroundColor:
                          selectedIcon === item ? c.accent : c.secondary,
                      },
                    ]}
                    onPress={() => setSelectedIcon(item)}
                  >
                    <Ionicons
                      name={item as any}
                      size={24}
                      color={selectedIcon === item ? "#fff" : c.text}
                    />
                  </TouchableOpacity>
                )}
              />

              {/* カテゴリー名入力 */}
              <Text style={[styles.label, { color: c.text }]}>
                カテゴリー名
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: c.border,
                    backgroundColor: c.card,
                    color: c.text,
                  },
                ]}
                placeholder="例: 交際費・サブスク費"
                placeholderTextColor={c.placeholder}
                value={name}
                onChangeText={setName}
              />

              {/* ボタン */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={handleCancel}
                  style={[styles.button, { backgroundColor: c.secondary }]}
                >
                  <Text style={[styles.buttonText, { color: c.text }]}>
                    キャンセル
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  style={[styles.button, { backgroundColor: c.accent }]}
                >
                  <Text style={[styles.buttonText, { color: "#fff" }]}>
                    保存
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CategoryEditModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "92%",
    borderRadius: 16,
    padding: 18,
    maxHeight: "85%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 6,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  iconButton: {
    width: 46,
    height: 46,
    margin: 4,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
