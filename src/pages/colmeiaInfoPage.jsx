import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Footer from "../components/footer";
import Header from "../components/header";
// import { colors } from "../theme/colors"; // REMOVIDO
import { useTheme } from "../theme/ThemeContext"; // IMPORTADO

// Biblioteca de Data
import DateTimePicker from "@react-native-community/datetimepicker";

import { db, auth } from "../firebase/firebaseConfig";
import { ref, update, remove, set, onValue } from "firebase/database";

export default function ColmeiaInfoPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme(); // HOOK DO TEMA

  const { colmeia } = route.params;

  const [isEditing, setIsEditing] = useState(false);

  // --- Estados de Edição ---
  const [editNome, setEditNome] = useState(colmeia.nome);
  const [editTipo, setEditTipo] = useState(colmeia.tipo);
  const [editOrigem, setEditOrigem] = useState(colmeia.origem);
  const [editObs, setEditObs] = useState(colmeia.observacao || "");

  // Data
  const [date, setDate] = useState(new Date());
  const [editDataTexto, setEditDataTexto] = useState(colmeia.dataInstalacao);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- Lógica de Mudança de Apiário ---
  const [apiariosList, setApiariosList] = useState([]);
  const [selectedApiario, setSelectedApiario] = useState(null);
  const [modalApiarioVisible, setModalApiarioVisible] = useState(false);

  // Modal Tipo
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
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10 },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    backIcon: { width: 24, height: 24, tintColor: theme.text },
    iconTitleBox: { flexDirection: "row", alignItems: "center" },
    titleIcon: {
      width: 28,
      height: 28,
      marginRight: 10,
      tintColor: theme.text,
    },
    pageTitle: { fontSize: 20, fontWeight: "bold", color: theme.text },

    infoContainer: { marginBottom: 20 },
    label: {
      fontSize: 14,
      fontWeight: "bold",
      marginTop: 10,
      marginBottom: 5,
      color: theme.text,
    },
    value: {
      fontSize: 16,
      color: theme.textSecondary,
      marginBottom: 10,
      paddingLeft: 2,
    },

    input: {
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 10,
      fontSize: 16,
      backgroundColor: theme.inputBackground,
      marginBottom: 5,
      color: theme.text, // Cor do texto digitado
    },
    selectButton: {
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 12,
      marginBottom: 5,
      backgroundColor: theme.inputBackground,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectText: { fontSize: 16, color: theme.text },
    arrowText: { fontSize: 16, color: theme.text },
    textArea: { height: 100 },

    editButton: {
      backgroundColor: theme.primary,
      borderRadius: 25,
      paddingVertical: 15,
      alignItems: "center",
      marginBottom: 15,
    },
    deleteButton: {
      backgroundColor: theme.danger,
      borderRadius: 25,
      paddingVertical: 15,
      alignItems: "center",
      marginBottom: 20,
    },
    saveButton: {
      backgroundColor: theme.primary,
      borderRadius: 25,
      paddingVertical: 15,
      alignItems: "center",
      marginBottom: 15,
    },
    cancelButton: {
      backgroundColor: theme.cardBackground, // Adaptado
      borderWidth: 1,
      borderColor: theme.textSecondary,
      borderRadius: 25,
      paddingVertical: 15,
      alignItems: "center",
      marginBottom: 20,
    },
    buttonText: { color: theme.white, fontWeight: "bold", fontSize: 16 },
    cancelText: { color: theme.text, fontWeight: "bold", fontSize: 16 },

    // Modais
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      padding: 20,
    },
    modalContainer: {
      backgroundColor: theme.cardBackground, // Adaptado
      borderRadius: 10,
      padding: 20,
      maxHeight: "60%",
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
      borderBottomColor: theme.inputBorder,
    },
    modalItemText: { fontSize: 16, color: theme.text },
    modalClose: { marginTop: 15, alignItems: "center", padding: 10 },
    cancelModalText: { color: theme.danger, fontWeight: "bold", fontSize: 16 },
  });

  // 1. Carregar lista de Apiários
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const apiariosRef = ref(db, `usuarios/${user.uid}/apiarios`);
    onValue(apiariosRef, (snapshot) => {
      const data = snapshot.val();
      let lista = [];
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          const item = { id: key, nome: value.nome };
          lista.push(item);
          if (key === colmeia.apiarioId) {
            setSelectedApiario(item);
          }
        });
      }
      setApiariosList(lista);
    });
  }, []);

  const getColmeiaRef = (apiarioId, colmeiaId) => {
    const user = auth.currentUser;
    if (!user) return null;
    return ref(
      db,
      `usuarios/${user.uid}/apiarios/${apiarioId}/colmeias/${colmeiaId}`
    );
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toLocaleDateString("pt-BR");
      setEditDataTexto(formattedDate);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const updatedData = {
      nome: editNome,
      tipo: editTipo,
      dataInstalacao: editDataTexto,
      origem: editOrigem,
      observacao: editObs,
      ultimaAtualizacao: Date.now(),
    };

    try {
      if (selectedApiario && selectedApiario.id !== colmeia.apiarioId) {
        const oldRef = getColmeiaRef(colmeia.apiarioId, colmeia.id);
        const newRef = getColmeiaRef(selectedApiario.id, colmeia.id);

        await set(newRef, updatedData);
        await remove(oldRef);

        Alert.alert(
          "Sucesso",
          `Colmeia movida para o apiário ${selectedApiario.nome}!`
        );

        colmeia.apiarioId = selectedApiario.id;
        colmeia.apiarioNome = selectedApiario.nome;
      } else {
        const currentRef = getColmeiaRef(colmeia.apiarioId, colmeia.id);
        await update(currentRef, updatedData);
        Alert.alert("Sucesso", "Colmeia atualizada!");
      }

      colmeia.nome = editNome;
      colmeia.tipo = editTipo;
      colmeia.dataInstalacao = editDataTexto;
      colmeia.origem = editOrigem;
      colmeia.observacao = editObs;

      setIsEditing(false);
    } catch (error) {
      console.log(error);
      Alert.alert("Erro", "Falha ao atualizar colmeia.");
    }
  };

  const handleDelete = () => {
    const colmeiaRef = getColmeiaRef(colmeia.apiarioId, colmeia.id);
    Alert.alert("Deletar", "Tem certeza? Ação irreversível.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: async () => {
          try {
            await remove(colmeiaRef);
            navigation.goBack();
          } catch (e) {
            Alert.alert("Erro", "Falha ao deletar.");
          }
        },
      },
    ]);
  };

  // Modais
  const renderSimpleModal = (
    visible,
    setVisible,
    title,
    dataList,
    onSelect,
    labelExtractor
  ) => (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={dataList}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  setVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>
                  {labelExtractor ? labelExtractor(item) : item}
                </Text>
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
          <View style={styles.iconTitleBox}>
            <Image
              source={require("../../assets/icons/colmeias.png")}
              style={styles.titleIcon}
              resizeMode="contain"
            />
            <Text style={styles.pageTitle}>
              {isEditing ? "Editando..." : editNome}
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.infoContainer}>
          {/* APIÁRIO */}
          <Text style={styles.label}>Apiário</Text>
          {isEditing ? (
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setModalApiarioVisible(true)}
            >
              <Text style={styles.selectText}>
                {selectedApiario ? selectedApiario.nome : "Selecione"}
              </Text>
              <Text style={styles.arrowText}>▼</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>
              {colmeia.apiarioNome ||
                (selectedApiario ? selectedApiario.nome : "Carregando...")}
            </Text>
          )}

          {/* NOME */}
          <Text style={styles.label}>Nome da Colmeia *</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editNome}
              onChangeText={setEditNome}
            />
          ) : (
            <Text style={styles.value}>{editNome}</Text>
          )}

          {/* TIPO */}
          <Text style={styles.label}>Tipo *</Text>
          {isEditing ? (
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setModalTipoVisible(true)}
            >
              <Text style={styles.selectText}>{editTipo || "Selecione"}</Text>
              <Text style={styles.arrowText}>▼</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>{editTipo}</Text>
          )}

          {/* DATA */}
          <Text style={styles.label}>Data de Instalação *</Text>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.selectText}>{editDataTexto}</Text>
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
            </>
          ) : (
            <Text style={styles.value}>{editDataTexto}</Text>
          )}

          {/* ORIGEM */}
          <Text style={styles.label}>Origem da colmeia *</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editOrigem}
              onChangeText={setEditOrigem}
            />
          ) : (
            <Text style={styles.value}>{editOrigem}</Text>
          )}

          {/* OBSERVAÇÃO */}
          <Text style={styles.label}>Observação</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editObs}
              onChangeText={setEditObs}
              multiline={true}
              textAlignVertical="top"
            />
          ) : (
            <Text style={styles.value}>{editObs || "-"}</Text>
          )}
        </View>

        {/* Botões */}
        {isEditing ? (
          <>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Salvar Alterações</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelText}>Cancelar Edição</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.buttonText}>Deletar Colmeia</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ marginTop: 20 }}>
          <Footer />
        </View>
      </ScrollView>

      {/* Modais */}
      {renderSimpleModal(
        modalTipoVisible,
        setModalTipoVisible,
        "Tipo de Colmeia",
        tiposColmeia,
        setEditTipo
      )}
      {renderSimpleModal(
        modalApiarioVisible,
        setModalApiarioVisible,
        "Mover para Apiário",
        apiariosList,
        setSelectedApiario,
        (item) => item.nome
      )}
    </SafeAreaView>
  );
}
