import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeContext";

// Firebase Imports
import { auth } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";

export default function MenuPage() {
  const { theme, toggleTheme, isDark } = useTheme();

  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair.");
    }
  };

  const MenuItem = ({ icon, text, onPress }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.menuText}>{text}</Text>
    </TouchableOpacity>
  );
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 0,
  },
  header: {
    height: 60,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  closeButton: {
    padding: 5, // Mantém uma boa área de toque
    tintColor: theme.text,
  },
  closeText: {
    fontSize: 24, // ALTERADO: Reduzido de 28 para 24
    color:  theme.text,
    fontWeight: "bold",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 20,
    tintColor: theme.text,
  },
  menuText: {
    fontSize: 16,
    color: theme.text,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#CCC",
    marginVertical: 15,
  },
});
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          {/* Tamanho reduzido no estilo abaixo */}
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <MenuItem
          icon={require("../../assets/icons/home.png")}
          text="Tela inicial"
          onPress={() => navigation.navigate("HomePage")}
        />

        <MenuItem
          icon={require("../../assets/icons/user.png")}
          text="Perfil"
          onPress={() => navigation.navigate("UserPage")}
        />

        <MenuItem
          icon={require("../../assets/icons/apiarios.png")}
          text="Apiários"
          onPress={() => navigation.navigate("ApiariosPage")}
        />

        <MenuItem
          icon={require("../../assets/icons/colmeias.png")}
          text="Colmeias"
          onPress={() => navigation.navigate("ColmeiasPage")}
        />

        <MenuItem
          icon={require("../../assets/icons/inspecoes.png")}
          text="Inspeções"
          onPress={() => navigation.navigate("InspecaoPage")}
        />

        <MenuItem
          icon={require("../../assets/icons/producao.png")}
          text="Produção"
          onPress={() => navigation.navigate("ProducaoPage")}
        />

        <MenuItem
          icon={require("../../assets/icons/user.png")}
          text="Sobre nós"
          onPress={() => navigation.navigate("SobrePage")}
        />

        <MenuItem
        icon={require("../../assets/icons/contrast.png")}
          text={isDark ? "Tema Claro" : "Tema Escuro"}
          onPress={toggleTheme} // Chama a função que muda o estado global
        />

        {/* Linha Divisória */}
        <View style={styles.divider} />

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Image
            source={require("../../assets/icons/sign-out.png")}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.menuText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}


