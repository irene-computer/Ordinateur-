import { Pressable, ScrollView, Text, View } from "react-native";
import { CATEGORY_ICONS, formatPrice, type Product } from "../api";
import { useCart } from "../cart";
import { colors, s } from "../theme";

export function ProductScreen({ product, onAdded }: { product: Product; onAdded: () => void }) {
  const { add } = useCart();
  const inStock = product.stock > 0;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        <View style={{ height: 200, borderRadius: 12, backgroundColor: colors.tint, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 90 }}>{CATEGORY_ICONS[product.category] ?? "🖥️"}</Text>
        </View>
        <Text style={[s.muted, { marginTop: 16 }]}>{product.brand} · {product.category}</Text>
        <Text style={s.title}>{product.name}</Text>
        <Text style={[s.price, { fontSize: 26, marginVertical: 8 }]}>{formatPrice(product.priceCents)}</Text>
        <Text style={{ fontWeight: "600", color: inStock ? colors.success : colors.danger }}>
          {product.stock > 5 ? "En stock" : inStock ? `Plus que ${product.stock} en stock` : "Rupture de stock"}
        </Text>
        <Text style={{ color: colors.text, marginTop: 12, lineHeight: 22 }}>{product.description}</Text>
        <Text style={s.h2}>Caractéristiques</Text>
        <View style={[s.card, { paddingHorizontal: 14 }]}>
          {Object.entries(product.specs).map(([k, v], i) => (
            <View key={k} style={[s.row, { paddingVertical: 10, borderTopWidth: i ? 1 : 0, borderColor: colors.border, gap: 12 }]}>
              <Text style={s.muted}>{k.replace(/_/g, " ")}</Text>
              <Text style={{ color: colors.text, flexShrink: 1, textAlign: "right" }}>{v}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 16, backgroundColor: colors.bg, borderTopWidth: 1, borderColor: colors.border }}>
        <Pressable
          disabled={!inStock}
          style={[s.btn, !inStock && { backgroundColor: colors.border }]}
          onPress={() => { add(product); onAdded(); }}
        >
          <Text style={s.btnText}>{inStock ? "Ajouter au panier" : "Indisponible"}</Text>
        </Pressable>
      </View>
    </View>
  );
}
