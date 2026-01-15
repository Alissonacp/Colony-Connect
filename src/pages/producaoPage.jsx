import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Footer from "../components/footer";
import Header from "../components/header";

import { useTheme } from "../theme/ThemeContext"; 

import { db, auth } from "../firebase/firebaseConfig";
import { ref, onValue } from "firebase/database";

export default function ProducaoPage() {
  const navigation = useNavigation();
  const { theme } = useTheme(); // HOOK DO TEMA

  const [searchText, setSearchText] = useState("");
  const [producoes, setProducoes] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- ESTILOS COM TEMA ---
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { flex: 1, paddingHorizontal: 20 },
    pageHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      marginTop: 10,
      position: "relative",
    },
    backButton: { position: "absolute", left: 0, zIndex: 10, padding: 5 },
    backIcon: { width: 20, height: 20, tintColor: theme.text },
    pageTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.text,
      textAlign: "center",
    },
    newButton: {
      backgroundColor: theme.primary,
      borderRadius: 25,
      paddingVertical: 12,
      alignItems: "center",
      marginBottom: 20,
    },
    newButtonText: { color: theme.white, fontWeight: "bold", fontSize: 16 },
    searchContainer: { marginBottom: 20, justifyContent: "center" },
    searchIcon: {
      position: "absolute",
      left: 15,
      zIndex: 1,
      width: 20,
      height: 20,
      tintColor: theme.textSecondary,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 10,
      paddingHorizontal: 45,
      height: 45,
      backgroundColor: theme.inputBackground,
      fontSize: 16,
      color: theme.text,
    },
    listHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
      paddingHorizontal: 5,
      borderBottomWidth: 1,
      borderBottomColor: theme.primary,
    },
    listHeaderLabel: {
      fontWeight: "bold",
      fontSize: 14,
      color: theme.text,
      marginBottom: 5,
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 12,
      padding: 10,
      marginBottom: 10,
      backgroundColor: theme.cardBackground,
    },
    iconBox: {
      backgroundColor: theme.primary,
      width: 45,
      height: 45,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 15,
    },
    icon: { width: 28, height: 28, tintColor: theme.white },
    cardInfo: { flex: 1 },
    cardName: { fontWeight: "bold", fontSize: 16, color: theme.text },
    cardDate: {
      position: "absolute",
      right: 0,
      top: 0,
      color: theme.textSecondary,
      fontSize: 14,
    },
    cardSub: { color: theme.textSecondary, fontSize: 12, marginTop: 4 },
    emptyText: {
      textAlign: "center",
      marginTop: 20,
      color: theme.textSecondary,
    },
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const producoesRef = ref(db, `usuarios/${user.uid}/producoes`);

    const unsubscribe = onValue(producoesRef, (snapshot) => {
      const data = snapshot.val();
      const lista = [];

      if (data) {
        for (let id in data) {
          lista.push({
            id: id,
            ...data[id],
          });
        }
      }
      setProducoes(lista.reverse());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredData = producoes.filter((item) => {
    const term = searchText.toLowerCase();
    return (
      (item.tipo && item.tipo.toLowerCase().includes(term)) ||
      (item.colmeiaEnvolvida &&
        item.colmeiaEnvolvida.toLowerCase().includes(term))
    );
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ProducaoInfoPage", { producao: item })
      }
    >
      <View style={styles.iconBox}>
        <Image
          source={require("../../assets/icons/producao.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.tipo || "Produção"}</Text>
        <Text style={styles.cardDate}>{item.dataProducao}</Text>
        <Text style={styles.cardSub}>
          {item.quantidade} • {item.colmeiaEnvolvida}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={() => navigation.navigate("MenuPage")} />

      <View style={styles.content}>
        <View style={styles.pageHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Image
              source={require("../../assets/icons/left-arrow.svg")}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Produção</Text>
        </View>

        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate("CadProducaoPage")}
        >
          <Text style={styles.newButtonText}>+ Novo</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <Image
            source={require("../../assets/icons/search.svg")}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="buscar"
            placeholderTextColor={theme.textSecondary} // Importante
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listHeaderLabel}>Nome</Text>
          <Text style={styles.listHeaderLabel}>Data de colheita</Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={theme.primary}
            style={{ marginTop: 20 }}
          />
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhuma produção registrada.</Text>
            }
          />
        )}
      </View>
      <Footer />
    </SafeAreaView>
  );
}
