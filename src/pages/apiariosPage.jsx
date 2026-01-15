import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Footer from "../components/footer";
import Header from "../components/header";
import { colors } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
// --- firebase imports ---
import { db, auth } from "../firebase/firebaseConfig";
import { ref, onValue } from "firebase/database";

export default function ApiariosPage() {
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState("");
  const [apiarios, setApiarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();

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
    tintColor: "#999",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 10,
    paddingHorizontal: 45,
    height: 45,
    backgroundColor: theme.inputBackground,
    fontSize: 16,
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
  cardInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardName: { fontWeight: "bold", fontSize: 16, color: theme.text },
  cardDate: { color: theme.textSecondary, fontSize: 14 },
});

  // --- busca dados do usuario logado ---
  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Atenção", "Usuário não identificado.");
      setLoading(false);
      return;
    }

    // Caminho dinâmico usando user.uid
    const apiariosRef = ref(db, `usuarios/${user.uid}/apiarios`);

    const unsubscribe = onValue(apiariosRef, (snapshot) => {
      const data = snapshot.val();
      const listaFormatada = [];

      if (data) {
        for (let id in data) {
          listaFormatada.push({
            id: id,
            ...data[id],
          });
        }
      }
      setApiarios(listaFormatada.reverse());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredData = apiarios.filter((item) => {
    const term = searchText.toLowerCase();
    return (
      (item.nome && item.nome.toLowerCase().includes(term)) ||
      (item.localizacao && item.localizacao.toLowerCase().includes(term))
    );
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("ApiarioInfoPage", { apiario: item })}
    >
      <View style={styles.iconBox}>
        <Image
          source={require("../../assets/icons/apiarios.png")}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.nome}</Text>
        <Text style={styles.cardDate}>{item.dataInstalacao}</Text>
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
          <Text style={styles.pageTitle}>Apiários</Text>
        </View>

        <TouchableOpacity
          style={styles.newButton}
          onPress={() => navigation.navigate("CadApiarioPage")}
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
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={styles.listHeaderLabel}>Nome</Text>
          <Text style={styles.listHeaderLabel}>Data de instalação</Text>
        </View>

        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 20 }}>
            Carregando...
          </Text>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <Text
                style={{ textAlign: "center", marginTop: 20, color: "#666" }}
              >
                Nenhum apiário cadastrado.
              </Text>
            }
          />
        )}
      </View>
      <Footer />
    </SafeAreaView>
  );
}

