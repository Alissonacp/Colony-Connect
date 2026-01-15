import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Footer from "../components/footer";
import Header from "../components/header";

// Importação direta de cores (Sem Contexto)
import { colors } from "../theme/colors";
import { useTheme } from "../theme/ThemeContext";
// Firebase
import { auth, db } from "../firebase/firebaseConfig";
import { signOut, deleteUser } from "firebase/auth";
import { ref, onValue, remove } from "firebase/database";

export default function UserPage() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const userRef = ref(db, `usuarios/${user.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserData(snapshot.val());
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Reseta para login
      navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair.");
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Deletar Conta",
      "Tem certeza? Seus dados serão apagados para sempre.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sim, Deletar", style: "destructive", onPress: confirmDelete },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!user) return;
    try {
      // Remove do banco
      await remove(ref(db, `usuarios/${user.uid}`));
      // Remove autenticação
      await deleteUser(user);

      Alert.alert("Conta deletada", "Sua conta foi removida.");
      navigation.reset({ index: 0, routes: [{ name: "LoginPage" }] });
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        Alert.alert("Segurança", "Faça login novamente para deletar.");
        handleLogout();
      } else {
        Alert.alert("Erro", "Não foi possível deletar.");
      }
    }
  };

  const InfoRow = ({ label, value }) => (
    <View style={styles.infoContainer}>
      <View style={styles.infoTextContainer}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value} numberOfLines={1}>
          {label === "Senha" ? "••••••••" : value || "Não informado"}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => Alert.alert("Editar", "Em breve")}
      >
        <Text style={styles.editButtonText}>Editar</Text>
      </TouchableOpacity>
    </View>
  );
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

    avatarContainer: { alignItems: "center", marginTop: 10, marginBottom: 30 },
    avatarCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 2,
      borderColor: "#A020F0",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#F3E5F5",
      overflow: "hidden",
    },
    avatarImage: { width: "100%", height: "100%" },

    formArea: { marginBottom: 30 },
    infoContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    infoTextContainer: { flex: 1, marginRight: 10 },
    label: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 4,
    },
    value: { fontSize: 16, color: theme.textSecondary },

    editButton: {
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 8,
    },
    editButtonText: { fontSize: 14, fontWeight: "bold", color: theme.text },

    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 25,
      paddingVertical: 12,
      marginBottom: 20,
    },
    logoutIcon: {
      width: 20,
      height: 20,
      marginRight: 10,
      tintColor: theme.text,
    },
    logoutText: { fontSize: 16, fontWeight: "bold", color: theme.text },

    deleteContainer: { alignItems: "center", marginBottom: 20 },
    deleteText: {
      color: theme.danger,
      fontSize: 14,
      textDecorationLine: "underline",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={() => navigation.navigate("MenuPage")} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Image
              source={require("../../assets/icons/user.png")}
              style={styles.avatarImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : (
          <View style={styles.formArea}>
            <InfoRow label="Nome completo" value={userData?.nome} />
            <InfoRow label="E-mail" value={user?.email} />
            <InfoRow label="Senha" value="********" />
          </View>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Image
            source={require("../../assets/icons/sign-out.png")}
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteContainer}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteText}>Deletar Conta</Text>
        </TouchableOpacity>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
}


