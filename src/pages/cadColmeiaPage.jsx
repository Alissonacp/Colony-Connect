import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Alert,
  Modal,
  FlatList,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Footer from "../components/footer";
import Header from "../components/header";
// import { colors } from "../theme/colors"; // REMOVIDO
import { useTheme } from "../theme/ThemeContext"; // IMPORTADO

// Biblioteca de Data
import DateTimePicker from "@react-native-community/datetimepicker";

import { db, auth } from "../firebase/firebaseConfig";
import { ref, push, set, onValue } from "firebase/database";

export default function CadColmeiaPage() {
  const navigation = useNavigation();
  const { theme } = useTheme(); // HOOK DO TEMA

  // Estados dos Campos
  const [nome, setNome] = useState("");
  const [tipo, setTipo] = useState("");
  const [origem, setOrigem] = useState("");
  const [obs, setObs] = useState("");

  // Estados de Data
  const [date, setDate] = useState(new Date());
  const [dataTexto, setDataTexto] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estados dos Modais
  const [apiariosList, setApiariosList] = useState([]);
  const [selectedApiario, setSelectedApiario] = useState(null);

  const [modalApiarioVisible, setModalApiarioVisible] = useState(false);
  const [modalTipoVisible, setModalTipoVisible] = useState(false);

  const tiposColmeia = [
    "Langstroth",
    "Dadant",
    "Top Bar",
    "Warre",
    "Núcleo",
    "Outro",
  ];

  // --- ESTILOS COM TEMA ---
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 10,
    },
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
      color: theme.text, // Cor do texto digitado
    },
    textArea: { height: 100 },

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
    arrowText: { fontSize: 16, color: theme.text }, // Seta do select

    // Modais
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 20,
    },
    modalContainer: {
      backgroundColor: theme.cardBackground, // Importante para dark mode
      borderRadius: 10,
      padding: 20,
      maxHeight: "50%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
      textAlign: "center",
      color: theme.text,
    },
    modalItem: {
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.inputBorder, // Divisor sutil
    },
    modalItemText: { fontSize: 16, color: theme.text },
    modalClose: { marginTop: 15, alignItems: "center", padding: 10 },
    cancelModalText: { color: theme.danger, fontWeight: "bold", fontSize: 16 },

    saveButton: {
      backgroundColor: theme.primary,
      borderRadius: 25,
      paddingVertical: 15,
      alignItems: "center",
      marginBottom: 15,
    },
    saveText: { color: theme.white, fontWeight: "bold", fontSize: 16 },
    cancelButton: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.textSecondary,
      borderRadius: 25,
      paddingVertical: 15,
      alignItems: "center",
      marginBottom: 20,
    },
    cancelText: { color: theme.text, fontWeight: "bold", fontSize: 16 },
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const apiariosRef = ref(db, `usuarios/${user.uid}/apiarios`);
    onValue(apiariosRef, (snapshot) => {
      const data = snapshot.val();
      let lista = [];
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          lista.push({ id: key, nome: value.nome });
        });
      }
      setApiariosList(lista);
    });
  }, []);

  // --- Lógica do Calendário ---
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

    if (!selectedApiario)
      return Alert.alert("Atenção", "Selecione um Apiário.");
    if (!nome.trim()) return Alert.alert("Atenção", "Preencha o Nome.");
    if (!tipo.trim()) return Alert.alert("Atenção", "Selecione o Tipo.");
    if (!dataTexto) return Alert.alert("Atenção", "Selecione a Data.");
    if (!origem.trim()) return Alert.alert("Atenção", "Preencha a Origem.");

    try {
      const novaColmeia = {
        nome: nome.trim(),
        tipo: tipo.trim(),
        dataInstalacao: dataTexto,
        origem: origem.trim(),
        observacao: obs.trim(),
        apiarioId: selectedApiario.id,
        dataCadastro: Date.now(),
      };

      const colmeiasRef = ref(
        db,
        `usuarios/${user.uid}/apiarios/${selectedApiario.id}/colmeias`
      );
      const novoReg = push(colmeiasRef);
      await set(novoReg, novaColmeia);

      Alert.alert("Sucesso", "Colmeia cadastrada!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar.");
    }
  };

  // Modal Auxiliar
  const renderModal = (visible, setVisible, title, dataList, onSelect) => (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={dataList}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.nome || item}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setVisible(false)}
          >
            <Text style={styles.cancelModalText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

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
          <Text style={styles.pageTitle}>+ Nova Colmeia</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subText}>Campos com * são obrigatórios</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Apiário *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setModalApiarioVisible(true)}
          >
            <Text
              style={
                selectedApiario ? styles.selectText : styles.placeholderText
              }
            >
              {selectedApiario ? selectedApiario.nome : "Selecione uma opção"}
            </Text>
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Nome da Colmeia *</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Colmeia 01"
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={styles.label}>Tipo *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setModalTipoVisible(true)}
          >
            <Text style={tipo ? styles.selectText : styles.placeholderText}>
              {tipo || "Ex: Langstroth"}
            </Text>
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>

          {/* --- SELETOR DE DATA --- */}
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

          <Text style={styles.label}>Origem da colmeia *</Text>
          <TextInput
            style={styles.input}
            value={origem}
            onChangeText={setOrigem}
            placeholder="Ex: Divisão"
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={styles.label}>Observação</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={obs}
            onChangeText={setObs}
            multiline={true}
            textAlignVertical="top"
            placeholderTextColor={theme.textSecondary}
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

      {/* Modais */}
      {renderModal(
        modalApiarioVisible,
        setModalApiarioVisible,
        "Escolha um Apiário",
        apiariosList,
        setSelectedApiario
      )}
      {renderModal(
        modalTipoVisible,
        setModalTipoVisible,
        "Tipo de Colmeia",
        tiposColmeia,
        setTipo
      )}
    </SafeAreaView>
  );
}
