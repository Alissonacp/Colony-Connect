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
import { ref, update, remove, onValue } from "firebase/database";

export default function ProducaoInfoPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme(); // HOOK DO TEMA

  // Dados vindos da lista
  const { producao } = route.params;

  const [isEditing, setIsEditing] = useState(false);

  // --- Estados de Edição ---
  const [editNome, setEditNome] = useState(producao.nome || "");
  const [editProduto, setEditProduto] = useState(
    producao.produto || producao.tipo || ""
  );
  const [editQtd, setEditQtd] = useState(producao.quantidade || "");
  const [editObs, setEditObs] = useState(producao.observacao || "");

  // Data (Calendário)
  const [date, setDate] = useState(new Date());
  const [editDataTexto, setEditDataTexto] = useState(
    producao.dataProducao || ""
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Apiário (Select)
  const [apiariosList, setApiariosList] = useState([]);
  const [selectedApiario, setSelectedApiario] = useState(null);
  const [modalApiarioVisible, setModalApiarioVisible] = useState(false);

  // Colmeias (Multi-Select)
  const [colmeiasList, setColmeiasList] = useState([]);
  const [selectedColmeias, setSelectedColmeias] = useState([]);
  const [modalColmeiasVisible, setModalColmeiasVisible] = useState(false);
  const [textoColmeias, setTextoColmeias] = useState(
    producao.colmeiaEnvolvida || ""
  );

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

    infoContainer: { marginBottom: 30 },

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

    // Inputs e Selects
    input: {
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 10,
      marginBottom: 5,
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
      marginBottom: 5,
      backgroundColor: theme.inputBackground,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    selectText: { fontSize: 16, color: theme.text, flex: 1, marginRight: 10 },
    placeholderText: { fontSize: 16, color: theme.textSecondary },
    arrowText: { fontSize: 16, color: theme.text },
    textArea: { height: 100 },

    // Botões
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
      backgroundColor: theme.cardBackground, // Importante para dark mode
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
    // Item selecionado (borda colorida)
    modalItemSelected: {
      borderColor: theme.primary,
      borderWidth: 1,
      borderRadius: 5,
      backgroundColor: theme.inputBackground,
    },
    modalItemText: { fontSize: 16, color: theme.text },
    modalClose: { marginTop: 15, alignItems: "center", padding: 10 },
    cancelModalText: { color: theme.danger, fontWeight: "bold", fontSize: 16 },
    saveButtonModal: {
      backgroundColor: theme.primary,
      borderRadius: 25,
      paddingVertical: 12,
      alignItems: "center",
      marginTop: 15,
    },
    saveText: { color: theme.white, fontWeight: "bold", fontSize: 16 },
  });

  // 1. Carregar Apiários
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
          if (key === producao.apiarioId) {
            setSelectedApiario(item);
          }
        });
      }
      setApiariosList(lista);
    });
  }, []);

  // 2. Carregar Colmeias
  useEffect(() => {
    if (selectedApiario && selectedApiario.id !== producao.apiarioId) {
      setTextoColmeias("");
      setSelectedColmeias([]);
    }

    if (selectedApiario) {
      const user = auth.currentUser;
      const colmeiasRef = ref(
        db,
        `usuarios/${user.uid}/apiarios/${selectedApiario.id}/colmeias`
      );

      onValue(colmeiasRef, (snapshot) => {
        const data = snapshot.val();
        let lista = [];
        if (data) {
          Object.entries(data).forEach(([key, value]) => {
            lista.push({ id: key, nome: value.nome });
          });
        }
        setColmeiasList(lista);

        if (selectedApiario.id === producao.apiarioId && producao.colmeiasIds) {
          const preSelected = lista.filter((c) =>
            producao.colmeiasIds.includes(c.id)
          );
          setSelectedColmeias(preSelected);
        }
      });
    }
  }, [selectedApiario]);

  // 3. Atualizar texto
  useEffect(() => {
    if (selectedColmeias.length > 0) {
      const nomes = selectedColmeias.map((c) => c.nome).join(", ");
      setTextoColmeias(nomes);
    } else if (isEditing && selectedApiario?.id !== producao.apiarioId) {
      setTextoColmeias("");
    }
  }, [selectedColmeias]);

  const toggleColmeia = (colmeia) => {
    const exists = selectedColmeias.find((c) => c.id === colmeia.id);
    if (exists) {
      setSelectedColmeias(selectedColmeias.filter((c) => c.id !== colmeia.id));
    } else {
      setSelectedColmeias([...selectedColmeias, colmeia]);
    }
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

    try {
      const producaoRef = ref(
        db,
        `usuarios/${user.uid}/producoes/${producao.id}`
      );

      await update(producaoRef, {
        nome: editNome,
        dataProducao: editDataTexto,
        apiarioId: selectedApiario ? selectedApiario.id : producao.apiarioId,
        apiarioNome: selectedApiario
          ? selectedApiario.nome
          : producao.apiarioNome,

        colmeiaEnvolvida: textoColmeias,
        colmeiasIds: selectedColmeias.map((c) => c.id),

        produto: editProduto,
        quantidade: editQtd,
        observacao: editObs,
        ultimaAtualizacao: Date.now(),
      });

      Alert.alert("Sucesso", "Produção atualizada!");
      setIsEditing(false);

      producao.nome = editNome;
      producao.dataProducao = editDataTexto;
      producao.colmeiaEnvolvida = textoColmeias;
      producao.produto = editProduto;
      producao.quantidade = editQtd;
      producao.observacao = editObs;
      producao.apiarioNome = selectedApiario?.nome;
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar.");
    }
  };

  const handleDelete = () => {
    const user = auth.currentUser;
    Alert.alert("Deletar", "Tem certeza?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Deletar",
        style: "destructive",
        onPress: async () => {
          try {
            await remove(
              ref(db, `usuarios/${user.uid}/producoes/${producao.id}`)
            );
            navigation.goBack();
          } catch (e) {
            Alert.alert("Erro", "Falha ao deletar.");
          }
        },
      },
    ]);
  };

  // --- Modais ---
  const renderModalApiario = () => (
    <Modal
      visible={modalApiarioVisible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Escolha um Apiário</Text>
          <FlatList
            data={apiariosList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  setSelectedApiario(item);
                  setModalApiarioVisible(false);
                }}
              >
                <Text style={styles.modalItemText}>{item.nome}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setModalApiarioVisible(false)}
          >
            <Text style={styles.cancelModalText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderModalColmeias = () => (
    <Modal
      visible={modalColmeiasVisible}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecione as Colmeias</Text>
          {colmeiasList.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                marginVertical: 20,
                color: theme.textSecondary,
              }}
            >
              Sem colmeias neste apiário.
            </Text>
          ) : (
            <FlatList
              data={colmeiasList}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const isSelected = selectedColmeias.some(
                  (c) => c.id === item.id
                );
                return (
                  <TouchableOpacity
                    style={[
                      styles.modalItem,
                      isSelected && styles.modalItemSelected,
                    ]}
                    onPress={() => toggleColmeia(item)}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        isSelected && {
                          color: theme.primary,
                          fontWeight: "bold",
                        },
                      ]}
                    >
                      {isSelected ? "☑ " : "☐ "} {item.nome}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          )}
          <TouchableOpacity
            style={styles.saveButtonModal}
            onPress={() => setModalColmeiasVisible(false)}
          >
            <Text style={styles.saveText}>Confirmar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Header onMenuPress={() => navigation.navigate("MenuPage")} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Cabeçalho */}
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
              source={require("../../assets/icons/producao.png")}
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
          {/* NOME */}
          <Text style={styles.label}>Nome:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editNome}
              onChangeText={setEditNome}
              placeholderTextColor={theme.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{editNome}</Text>
          )}

          {/* DATA */}
          <Text style={styles.label}>Data da produção:</Text>
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

          {/* APIÁRIO */}
          <Text style={styles.label}>Apiário:</Text>
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
              {selectedApiario
                ? selectedApiario.nome
                : producao.apiarioNome || "Não informado"}
            </Text>
          )}

          {/* COLMEIAS */}
          <Text style={styles.label}>Colmeia(s) envolvida(s):</Text>
          {isEditing ? (
            <TouchableOpacity
              style={[
                styles.selectButton,
                !selectedApiario && { opacity: 0.5 },
              ]}
              onPress={() => {
                if (!selectedApiario)
                  Alert.alert("Aviso", "Selecione um apiário primeiro.");
                else setModalColmeiasVisible(true);
              }}
            >
              <Text
                style={
                  textoColmeias ? styles.selectText : styles.placeholderText
                }
                numberOfLines={1}
              >
                {textoColmeias || "Selecione..."}
              </Text>
              <Text style={styles.arrowText}>▼</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>
              {textoColmeias || producao.colmeiaEnvolvida || "-"}
            </Text>
          )}

          {/* PRODUTO */}
          <Text style={styles.label}>Produto(s):</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editProduto}
              onChangeText={setEditProduto}
              placeholderTextColor={theme.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{editProduto}</Text>
          )}

          {/* QUANTIDADE */}
          <Text style={styles.label}>Quantidade Produzida:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editQtd}
              onChangeText={setEditQtd}
              placeholderTextColor={theme.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{editQtd}</Text>
          )}

          {/* OBSERVAÇÃO */}
          <Text style={styles.label}>Observação:</Text>
          {isEditing ? (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editObs}
              onChangeText={setEditObs}
              multiline={true}
              textAlignVertical="top"
              placeholderTextColor={theme.textSecondary}
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
              <Text style={styles.buttonText}>Deletar</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ marginTop: 20 }}>
          <Footer />
        </View>
      </ScrollView>

      {renderModalApiario()}
      {renderModalColmeias()}
    </SafeAreaView>
  );
}
