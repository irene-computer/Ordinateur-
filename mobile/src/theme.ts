import { StyleSheet } from "react-native";

export const colors = {
  bg: "#f7f8fa",
  surface: "#ffffff",
  text: "#14171f",
  muted: "#646b7a",
  border: "#e3e6ec",
  primary: "#2f5bea",
  tint: "#eef2fd",
  success: "#1f8a4c",
  danger: "#c0392b",
};

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 18, fontWeight: "700", color: colors.text, marginTop: 20, marginBottom: 8 },
  muted: { color: colors.muted, fontSize: 13 },
  card: { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 12 },
  input: {
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: colors.text,
  },
  btn: { backgroundColor: colors.primary, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: 17, fontWeight: "700", color: colors.text },
});
