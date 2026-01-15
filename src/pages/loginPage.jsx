import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeContext";

// --- FIREBASE IMPORTS ---
import { auth } from "../firebase/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- ESTILOS COM TEMA ---
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: {
      padding: 20,
      justifyContent: "center",
      minHeight: "100%",
    },
    // Botão de Contraste
    themeButton: {
      position: "absolute",
      top: 10,
      right: 20,
      padding: 10,
      zIndex: 10,
    },
    themeIcon: {
      width: 28,
      height: 28,
      tintColor: theme.text,
    },
    logoContainer: { alignItems: "center", marginBottom: 30, marginTop: 20 },
    logoImage: {
      width: 80,
      height: 80,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      textAlign: "center",
      marginBottom: 30,
    },
    form: { marginBottom: 20 },
    label: {
      fontSize: 14,
      color: theme.text,
      marginBottom: 8,
      fontWeight: "500",
    },
    input: {
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
      fontSize: 16,
      backgroundColor: theme.inputBackground,
      color: theme.text,
    },
    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 8,
      marginBottom: 20,
      backgroundColor: theme.inputBackground,
    },
    passwordInput: {
      flex: 1,
      padding: 12,
      fontSize: 16,
      color: theme.text,
    },
    // Estilo do botão do olho
    eyeIconBtn: {
      padding: 12,
      justifyContent: "center",
      alignItems: "center",
    },
    // Estilo da imagem do olho
    eyeImage: {
      width: 24,
      height: 24,
      tintColor: theme.textSecondary, // Adapta a cor ao tema
    },
    loginButton: {
      backgroundColor: theme.primary,
      borderRadius: 25,
      paddingVertical: 15,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      elevation: 3,
    },
    loginButtonText: { color: theme.white, fontSize: 18, fontWeight: "bold" },
    footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
    footerText: { color: theme.textSecondary, fontSize: 14 },
    linkText: { color: theme.primary, fontWeight: "bold", fontSize: 14 },
  });

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Erro", "Preencha todos os campos!");
    }

    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log("Logado com sucesso:", user.uid);
      setLoading(false);

      navigation.reset({
        index: 0,
        routes: [{ name: "HomePage" }],
      });
    } catch (error) {
      setLoading(false);
      console.error(error);

      if (error.code === "auth/invalid-email")
        Alert.alert("Erro", "E-mail inválido.");
      else if (error.code === "auth/user-not-found")
        Alert.alert("Erro", "Usuário não encontrado.");
      else if (error.code === "auth/wrong-password")
        Alert.alert("Erro", "Senha incorreta.");
      else if (error.code === "auth/invalid-credential")
        Alert.alert("Erro", "Credenciais inválidas.");
      else Alert.alert("Erro", "Não foi possível fazer login.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* BOTÃO DARK MODE */}
        <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
          <Image
            source={require("../../assets/icons/contrast.png")}
            style={styles.themeIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/icons/logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Fazer login</Text>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="seuemail@email.com"
            placeholderTextColor={theme.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword} // Inverte a lógica (se show=true, secure=false)
            />

            {/* --- LÓGICA DO ÍCONE DE SENHA --- */}
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIconBtn}
            >
              <Image
                source={
                  showPassword
                    ? require("../../assets/icons/visibility_off.png") // Se a senha tá visível, mostra ícone de "fechar olho"
                    : require("../../assets/icons/visibility.png") // Se a senha tá oculta, mostra ícone de "abrir olho"
                }
                style={styles.eyeImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta ainda? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("CadUserPage")}>
            <Text style={styles.linkText}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
