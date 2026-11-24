import { useState } from "react";
import { Platform, Pressable, StatusBar as RNStatusBar, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import type { Product } from "./api";
import { CartProvider, useCart } from "./cart";
import { CatalogScreen } from "./screens/CatalogScreen";
import { ProductScreen } from "./screens/ProductScreen";
import { CartScreen } from "./screens/CartScreen";
import { colors, s } from "./theme";

type Route = { name: "catalog" } | { name: "product"; product: Product } | { name: "cart" } | { name: "done"; orderId: string };

export default function App() {
  return (
    <CartProvider>
      <Shell />
    </CartProvider>
  );
}

function Shell() {
  const [route, setRoute] = useState<Route>({ name: "catalog" });
  const { count } = useCart();
  const topInset = Platform.OS === "android" ? RNStatusBar.currentHeight ?? 24 : Platform.OS === "ios" ? 50 : 0;

  return (
    <View style={[s.screen, { paddingTop: topInset }]}>
      <StatusBar style="dark" />
      <View style={[s.row, { paddingHorizontal: 16, height: 56, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }]}>
        {route.name === "catalog" ? (
          <Text style={{ fontSize: 22, fontWeight: "800", letterSpacing: -0.5 }}>
            Ordinateur<Text style={{ color: colors.primary }}>+</Text>
          </Text>
        ) : (
          <Pressable onPress={() => setRoute({ name: "catalog" })} hitSlop={10}>
            <Text style={{ fontSize: 16, color: colors.primary, fontWeight: "600" }}>‹ Catalogue</Text>
          </Pressable>
        )}
        <Pressable onPress={() => setRoute({ name: "cart" })} hitSlop={10} accessibilityLabel="Panier">
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            🛒 {count > 0 ? <Text style={{ color: colors.primary }}>{count}</Text> : null}
          </Text>
        </Pressable>
      </View>

      {route.name === "catalog" && <CatalogScreen onOpen={(product) => setRoute({ name: "product", product })} />}
      {route.name === "product" && <ProductScreen product={route.product} onAdded={() => setRoute({ name: "cart" })} />}
      {route.name === "cart" && (
        <CartScreen onBrowse={() => setRoute({ name: "catalog" })} onOrdered={(orderId) => setRoute({ name: "done", orderId })} />
      )}
      {route.name === "done" && (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
          <Text style={{ fontSize: 48 }}>✅</Text>
          <Text style={s.title}>Merci pour votre commande !</Text>
          <Text style={s.muted}>N° {route.orderId}</Text>
          <Pressable style={[s.btn, { paddingHorizontal: 24, marginTop: 8 }]} onPress={() => setRoute({ name: "catalog" })}>
            <Text style={s.btnText}>Continuer mes achats</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
