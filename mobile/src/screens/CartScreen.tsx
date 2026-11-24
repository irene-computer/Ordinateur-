import { useState } from "react";
import { ActivityIndicator, Linking, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { api, CATEGORY_ICONS, formatPrice, shippingFor } from "../api";
import { useCart } from "../cart";
import { colors, s } from "../theme";

const FIELDS = [
  { key: "fullName", label: "Nom complet", autoComplete: "name" },
  { key: "email", label: "E-mail", autoComplete: "email", keyboardType: "email-address" },
  { key: "address", label: "Adresse", autoComplete: "street-address" },
  { key: "postalCode", label: "Code postal", autoComplete: "postal-code", keyboardType: "number-pad" },
  { key: "city", label: "Ville", autoComplete: "postal-address-locality" },
] as const;

type Form = Record<(typeof FIELDS)[number]["key"], string>;

export function CartScreen({ onBrowse, onOrdered }: { onBrowse: () => void; onOrdered: (orderId: string) => void }) {
  const { items, totalCents, setQuantity, clear } = useCart();
  const [form, setForm] = useState<Form>({ fullName: "", email: "", address: "", postalCode: "", city: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const shipping = shippingFor(totalCents);

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
        <Text style={{ fontSize: 48 }}>🛒</Text>
        <Text style={s.title}>Votre panier est vide</Text>
        <Pressable style={[s.btn, { paddingHorizontal: 24 }]} onPress={onBrowse}><Text style={s.btnText}>Voir le catalogue</Text></Pressable>
      </View>
    );
  }

  async function checkout() {
    if (Object.values(form).some((v) => !v.trim())) return setError("Merci de remplir tous les champs.");
    setLoading(true);
    setError(undefined);
    try {
      const res = await api.checkout({ ...form, items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })) });
      clear();
      // Avec Stripe configuré côté serveur, on ouvre la page de paiement ; sinon la commande est déjà validée (simulation)
      if (!res.url.includes("simulation=1")) {
        if (Platform.OS === "web") window.location.href = res.url;
        else await Linking.openURL(res.url);
      }
      onOrdered(res.orderId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }} keyboardShouldPersistTaps="handled">
      {items.map(({ product, quantity }) => (
        <View key={product.id} style={[s.card, s.row, { padding: 12, gap: 10 }]}>
          <Text style={{ fontSize: 28 }}>{CATEGORY_ICONS[product.category] ?? "🖥️"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700", color: colors.text }}>{product.name}</Text>
            <Text style={s.muted}>{formatPrice(product.priceCents * quantity)}</Text>
          </View>
          <View style={[s.row, { gap: 6 }]}>
            <Stepper label="−" onPress={() => setQuantity(product.id, quantity - 1)} />
            <Text style={{ minWidth: 20, textAlign: "center", fontWeight: "600" }}>{quantity}</Text>
            <Stepper label="+" onPress={() => setQuantity(product.id, quantity + 1)} />
          </View>
        </View>
      ))}

      <View style={[s.card, { padding: 14, gap: 6 }]}>
        <View style={s.row}><Text style={s.muted}>Sous-total</Text><Text>{formatPrice(totalCents)}</Text></View>
        <View style={s.row}><Text style={s.muted}>Livraison</Text><Text>{shipping ? formatPrice(shipping) : "Offerte"}</Text></View>
        <View style={[s.row, { borderTopWidth: 1, borderColor: colors.border, paddingTop: 8 }]}>
          <Text style={{ fontWeight: "700" }}>Total</Text><Text style={s.price}>{formatPrice(totalCents + shipping)}</Text>
        </View>
      </View>

      <Text style={s.h2}>Livraison</Text>
      {FIELDS.map((f) => (
        <TextInput
          key={f.key}
          style={s.input}
          placeholder={f.label}
          value={form[f.key]}
          autoComplete={f.autoComplete}
          keyboardType={"keyboardType" in f ? f.keyboardType : "default"}
          autoCapitalize={f.key === "email" ? "none" : "words"}
          onChangeText={(v) => setForm((prev) => ({ ...prev, [f.key]: v }))}
        />
      ))}
      {error && <Text style={{ color: colors.danger }}>{error}</Text>}
      <Pressable style={[s.btn, { marginTop: 6 }]} onPress={checkout} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>Payer {formatPrice(totalCents + shipping)}</Text>}
      </Pressable>
    </ScrollView>
  );
}

function Stepper({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 30, height: 30, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 16, fontWeight: "700" }}>{label}</Text>
    </Pressable>
  );
}
