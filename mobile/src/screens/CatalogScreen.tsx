import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { api, CATEGORY_ICONS, formatPrice, type Product } from "../api";
import { useCart } from "../cart";
import { colors, s } from "../theme";

const CATEGORIES = ["Portables", "Gaming", "Bureau", "Écrans", "Accessoires", "Composants"];

export function CatalogScreen({ onOpen }: { onOpen: (p: Product) => void }) {
  const { add } = useCart();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api.products({ q: query, category })
        .then((p) => { setProducts(p); setError(undefined); })
        .catch(() => setError("Impossible de joindre le serveur. Le site web (dossier web) est-il démarré ?"))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query, category]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, paddingBottom: 8, gap: 12 }}>
        <TextInput style={s.input} placeholder="Rechercher un produit, une marque…" value={query} onChangeText={setQuery} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {[undefined, ...CATEGORIES].map((c) => {
            const active = c === category;
            return (
              <Pressable
                key={c ?? "all"}
                onPress={() => setCategory(c)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1,
                  borderColor: active ? colors.text : colors.border, backgroundColor: active ? colors.text : colors.surface,
                }}
              >
                <Text style={{ color: active ? colors.bg : colors.text, fontWeight: "500" }}>{c ?? "Tout"}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      ) : error ? (
        <Text style={[s.muted, { padding: 24, textAlign: "center" }]}>{error}</Text>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
          contentContainerStyle={{ padding: 12, paddingTop: 4 }}
          ListEmptyComponent={<Text style={[s.muted, { textAlign: "center", marginTop: 40 }]}>Aucun produit trouvé.</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => onOpen(item)} style={[s.card, { flex: 1, margin: 4, overflow: "hidden", maxWidth: "50%" }]}>
              <View style={{ height: 100, backgroundColor: colors.tint, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 42 }}>{CATEGORY_ICONS[item.category] ?? "🖥️"}</Text>
              </View>
              <View style={{ padding: 10, gap: 2, flex: 1 }}>
                <Text style={s.muted}>{item.brand}</Text>
                <Text style={{ fontWeight: "700", color: colors.text }} numberOfLines={2}>{item.name}</Text>
                <View style={[s.row, { marginTop: "auto", paddingTop: 8 }]}>
                  <Text style={s.price}>{formatPrice(item.priceCents)}</Text>
                  <Pressable
                    accessibilityLabel={`Ajouter ${item.name} au panier`}
                    disabled={item.stock <= 0}
                    onPress={() => add(item)}
                    style={{ backgroundColor: item.stock > 0 ? colors.primary : colors.border, borderRadius: 8, width: 32, height: 32, alignItems: "center", justifyContent: "center" }}
                  >
                    <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", lineHeight: 22 }}>+</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}
