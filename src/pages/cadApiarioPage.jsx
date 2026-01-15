import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Footer from "../components/footer";
import Header from "../components/header";
// import { colors } from "../theme/colors"; // REMOVIDO
import { useTheme } from "../theme/ThemeContext"; // IMPORTADO

// Import da Biblioteca de Data
import DateTimePicker from "@react-native-community/datetimepicker";

// Firebase
import { db, auth } from "../firebase/firebaseConfig";
import { ref, push, set } from "firebase/database";

export default function CadApiarioPage() {
  const navigation = useNavigation();
  const { theme } = useTheme(); // HOOK DO TEMA

  // Estados
  const [nome, setNome] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [obs, setObs] = useState("");

  // Estados de Data
  const [date, setDate] = useState(new Date());
  const [dataTexto, setDataTexto] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- ESTILOS COM TEMA ---
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    backIcon: { width: 24, height: 24, tintColor: theme.text },
    pageTitle: { fontSize: 20, fontWeight: "bold", color: theme.text },
    subText: { color: theme.textSecondary, fontSize: 12, marginBottom: 20 },
    form: { marginBottom: 20 },
    label: {
      fontSize: 14,
      fontWeight: "bold",
      marginBottom: 5,
      color: theme.text,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginBottom: 15,
      fontSize: 16,
      backgroundColor: theme.inputBackground,
      color: theme.text,
    },
    selectButton: {
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 15,
      backgroundColor: theme.inputBackground,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectText: { fontSize: 16, color: theme.text },
    placeholderText: { fontSize: 16, color: theme.textSecondary },
    textArea: { height: 100 },
    saveButton: {
      backgroundColor: theme.primary,
      borderRadius: 25,
      paddingVertical: 15,
      alignItems: "center",
      marginBottom: 15,
    },
    saveText: { color: theme.white, fontWeight: "bold", fontSize: 16 },
    cancelButton: {
      backgroundColor: theme.cardBackground, // Adaptado para dark mode
      borderWidth: 1,
      borderColor: theme.textSecondary,
      borderRadius: 25,
      paddingVertical: 15,
      alignItems: "center",
      marginBottom: 20,
    },
    cancelText: { color: theme.text, fontWeight: "bold", fontSize: 16 },
  });

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toLocaleDateString("pt-BR");
      setDataTexto(formattedDate);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Erro", "Usuário não logado.");

    if (!nome.trim())
      return Alert.alert("Atenção", "Preencha o Nome do Apiário.");
    if (!dataTexto)
      return Alert.alert("Atenção", "Selecione a Data de Instalação.");
    if (!localizacao.trim())
      return Alert.alert("Atenção", "Preencha a Localização.");

    try {
      const novoApiario = {
        nome: nome.trim(),
        dataInstalacao: dataTexto,
        qtdColmeias: 0,
        localizacao: localizacao.trim(),
        observacao: obs.trim(),
        dataCadastro: Date.now(),
      };

      const apiariosRef = ref(db, `usuarios/${user.uid}/apiarios`);
      const novoReg = push(apiariosRef);
      await set(novoReg, novoApiario);

      Alert.alert("Sucesso", "Apiário cadastrado!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={() => navigation.navigate("MenuPage")} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require("../../assets/icons/left-arrow.svg")}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>+ Novo Apiário</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subText}>Campos com * são obrigatórios</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Apiário 01"
            placeholderTextColor={theme.textSecondary} // Ajuste importante
          />

          <Text style={styles.label}>Data de instalação *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={dataTexto ? styles.selectText : styles.placeholderText}
            >
              {dataTexto || "DD/MM/AAAA"}
            </Text>
            <Text style={{ fontSize: 18, color: theme.text }}>📅</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Localização *</Text>
          <TextInput
            style={styles.input}
            value={localizacao}
            onChangeText={setLocalizacao}
            placeholder="Cidade/Estado"
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={styles.label}>Observação</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={obs}
            onChangeText={setObs}
            placeholder="Anotações..."
            placeholderTextColor={theme.textSecondary}
            multiline={true}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 20 }}>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}