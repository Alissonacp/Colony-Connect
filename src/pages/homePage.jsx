// src/pages/homePage.jsx
import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

// Componentes
import Header from "../components/header";
import Footer from "../components/footer";
import Epicos from "../components/epicos";

// IMPORTANTE: Importamos o Hook em vez das cores fixas
import { useTheme } from "../theme/ThemeContext";

const icons = {
  apiarios: require("../../assets/icons/apiarios.png"),
  colmeias: require("../../assets/icons/colmeias.png"),
  producao: require("../../assets/icons/producao.png"),
  inspecao: require("../../assets/icons/inspecoes.png"),
};

export default function HomePage() {
  const navigation = useNavigation();
  
  // Aqui pegamos o tema atual (claro ou escuro)
  const { theme } = useTheme();

  // Criamos os estilos aqui dentro para que eles tenham acesso ao 'theme'
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background, // Cor dinâmica
    },
    scrollContent: {
      paddingBottom: 20,
      flexGrow: 1,
    },
    titleContainer: {
      paddingHorizontal: 40,
      marginTop: 40,
      marginBottom: 50,
    },
    welcome: {
      fontSize: 24,
      fontWeight: "800",
      textAlign: "center",
      color: theme.text, // Cor dinâmica
      lineHeight: 32,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: 15,
      marginBottom: 50,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={() => navigation.navigate("MenuPage")} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.welcome}>Bem-vindo ao painel de controle</Text>
        </View>

        <View style={styles.grid}>
          <Epicos
            icon={icons.apiarios}
            label="Apiários"
            onPress={() => navigation.navigate("ApiariosPage")}
          />
          <Epicos
            icon={icons.colmeias}
            label="Colmeias"
            onPress={() => navigation.navigate("ColmeiasPage")}
          />
          <Epicos
            icon={icons.producao}
            label="Produção"
            onPress={() => navigation.navigate("ProducaoPage")}
          />
          <Epicos
            icon={icons.inspecao}
            label="Inspeção"
            onPress={() => navigation.navigate("InspecaoPage")}
          />
        </View>

        <Footer />
      </ScrollView>
    </SafeAreaView>
  );
}