import { TestIds } from "react-native-google-mobile-ads";

// adConfig.ts などのファイルで管理
export const AD_UNIT_IDS = {
  HomeScreen: __DEV__
    ? TestIds.BANNER // テスト用
    : "ca-app-pub-3188429419506365/7489699430", // 本番用
  BudgetScreen: __DEV__
    ? TestIds.BANNER
    : "ca-app-pub-3188429419506365/7339926471",
  SettingsScreen: __DEV__
    ? TestIds.BANNER
    : "ca-app-pub-3188429419506365/7980463414",
};
