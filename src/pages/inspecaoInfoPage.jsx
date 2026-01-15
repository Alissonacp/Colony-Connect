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

export default function InspecaoInfoPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme(); // HOOK DO TEMA

  const { inspecao } = route.params;

  const [isEditing, setIsEditing] = useState(false);

  // --- Estados de Edição ---
  const [editData, setEditData] = useState(inspecao.dataInspecao || "");
  const [editRainha, setEditRainha] = useState(inspecao.saudeRainha || "");
  const [editForca, setEditForca] = useState(inspecao.forcaColmeia || "");
  const [editPragas, setEditPragas] = useState(inspecao.pragasDoencas || "");
  const [editAcoes, setEditAcoes] = useState(inspecao.acoesRealizadas || "");
  const [editObs, setEditObs] = useState(inspecao.observacao || "");

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Apiário e Colmeias
  const [apiariosList, setApiariosList] = useState([]);
  const [selectedApiario, setSelectedApiario] = useState(null); // Apiário ATUAL (onde a colmeia está hoje)

  const [colmeiasList, setColmeiasList] = useState([]);
  const [selectedColmeias, setSelectedColmeias] = useState([]);
  const [modalColmeiasVisible, setModalColmeiasVisible] = useState(false);
  const [textoColmeias, setTextoColmeias] = useState(
    inspecao.colmeiaInspecionada || ""
  );

  // Modais
  const [modalRainhaVisible, setModalRainhaVisible] = useState(false);
  const [modalForcaVisible, setModalForcaVisible] = useState(false);

  const opcoesRainha = [
    "Presente e Sadia",
    "Presente, mas com Problemas",
    "Ausente",
    "Morta",
    "Virgem",
    "Postura Irregular",
  ];
  const opcoesForca = ["Muito Forte", "Forte", "Média", "Fraca", "Muito Fraca"];

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

  // 1. CARREGAR APIÁRIOS + DETECTAR MUDANÇA
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const apiariosRef = ref(db, `usuarios/${user.uid}/apiarios`);

    onValue(apiariosRef, async (snapshot) => {
      const data = snapshot.val();
      let listaApiarios = [];
      let apiarioEncontrado = null;

      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          const apiarioItem = { id: key, nome: value.nome };
          listaApiarios.push(apiarioItem);

          if (inspecao.colmeiasIds && value.colmeias) {
            const colmeiasDoApiario = Object.keys(value.colmeias);
            const taAqui = inspecao.colmeiasIds.some((id) =>
              colmeiasDoApiario.includes(id)
            );

            if (taAqui) {
              apiarioEncontrado = apiarioItem;
            }
          }
        });
      }
      setApiariosList(listaApiarios);

      if (apiarioEncontrado) {
        setSelectedApiario(apiarioEncontrado);

        if (apiarioEncontrado.id !== inspecao.apiarioId) {
          console.log("Colmeia mudou de endereço! Atualizando inspeção...");

          const inspRef = ref(
            db,
            `usuarios/${user.uid}/inspecoes/${inspecao.id}`
          );
          await update(inspRef, {
            apiarioId: apiarioEncontrado.id,
            apiarioNome: apiarioEncontrado.nome,
          });

          inspecao.apiarioId = apiarioEncontrado.id;
          inspecao.apiarioNome = apiarioEncontrado.nome;

          Alert.alert(
            "Atualização Automática",
            `Detectamos que as colmeias desta inspeção foram movidas para o apiário "${apiarioEncontrado.nome}". O registro foi atualizado.`
          );
        }
      } else {
        setSelectedApiario({
          id: inspecao.apiarioId,
          nome: inspecao.apiarioNome,
        });
      }
    });
  }, []);

  // 2. Carregar Colmeias
  useEffect(() => {
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

        if (inspecao.colmeiasIds) {
          const preSelected = lista.filter((c) =>
            inspecao.colmeiasIds.includes(c.id)
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
    } else if (isEditing) {
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
      setEditData(formattedDate);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const inspecaoRef = ref(
        db,
        `usuarios/${user.uid}/inspecoes/${inspecao.id}`
      );

      await update(inspecaoRef, {
        colmeiaInspecionada: textoColmeias,
        colmeiasIds: selectedColmeias.map((c) => c.id),
        apiarioId: selectedApiario ? selectedApiario.id : inspecao.apiarioId,
        apiarioNome: selectedApiario
          ? selectedApiario.nome
          : inspecao.apiarioNome,

        dataInspecao: editData,
        saudeRainha: editRainha,
        forcaColmeia: editForca,
        pragasDoencas: editPragas,
        acoesRealizadas: editAcoes,
        observacao: editObs,
        ultimaAtualizacao: Date.now(),
      });

      Alert.alert("Sucesso", "Inspeção atualizada!");
      setIsEditing(false);

      inspecao.colmeiaInspecionada = textoColmeias;
      inspecao.dataInspecao = editData;
      inspecao.saudeRainha = editRainha;
      inspecao.forcaColmeia = editForca;
      inspecao.pragasDoencas = editPragas;
      inspecao.acoesRealizadas = editAcoes;
      inspecao.observacao = editObs;
      inspecao.apiarioNome = selectedApiario?.nome;
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
              ref(db, `usuarios/${user.uid}/inspecoes/${inspecao.id}`)
            );
            navigation.goBack();
          } catch (e) {
            Alert.alert("Erro", "Falha ao deletar.");
          }
        },
      },
    ]);
  };

  const renderSimpleModal = (
    visible,
    setVisible,
    title,
    data,
    onSelect,
    labelExtractor
  ) => (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={data}
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
              source={require("../../assets/icons/inspecoes.png")}
              style={styles.titleIcon}
              resizeMode="contain"
            />
            <Text style={styles.pageTitle}>
              {isEditing ? "Editando..." : "Inspeção"}
            </Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.infoContainer}>
          {/* APIÁRIO (TRAVADO E AUTO-ATUALIZÁVEL) */}
          <Text style={styles.label}>
            Apiário (Localização atual das colmeias):
          </Text>
          {isEditing ? (
            <View
              style={[
                styles.selectButton,
                { backgroundColor: theme.inputBackground, opacity: 0.8 },
              ]}
            >
              <Text style={[styles.selectText, { color: theme.textSecondary }]}>
                {selectedApiario ? selectedApiario.nome : "Buscando..."}
              </Text>
              <Text style={{ color: theme.text }}>🔒</Text>
            </View>
          ) : (
            <Text style={styles.value}>
              {selectedApiario
                ? selectedApiario.nome
                : inspecao.apiarioNome || "Não informado"}
            </Text>
          )}

          {/* COLMEIAS */}
          <Text style={styles.label}>Colmeia(s):</Text>
          {isEditing ? (
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setModalColmeiasVisible(true)}
            >
              <Text
                style={
                  textoColmeias ? styles.selectText : styles.placeholderText
                }
                numberOfLines={1}
              >
                {textoColmeias || "Selecione..."}
              </Text>
              <Text style={{ color: theme.text }}>▼</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>
              {textoColmeias || inspecao.colmeiaInspecionada || "-"}
            </Text>
          )}

          {/* DATA */}
          <Text style={styles.label}>Data:</Text>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.selectText}>{editData}</Text>
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
            <Text style={styles.value}>{editData}</Text>
          )}

          {/* RAINHA */}
          <Text style={styles.label}>Saúde da Rainha:</Text>
          {isEditing ? (
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setModalRainhaVisible(true)}
            >
              <Text style={styles.selectText}>{editRainha || "Selecione"}</Text>
              <Text style={{ color: theme.text }}>▼</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>{editRainha}</Text>
          )}

          {/* FORÇA */}
          <Text style={styles.label}>Força da Colmeia:</Text>
          {isEditing ? (
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setModalForcaVisible(true)}
            >
              <Text style={styles.selectText}>{editForca || "Selecione"}</Text>
              <Text style={{ color: theme.text }}>▼</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.value}>{editForca}</Text>
          )}

          {/* CAMPOS DE TEXTO */}
          <Text style={styles.label}>Pragas/Doenças:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editPragas}
              onChangeText={setEditPragas}
            />
          ) : (
            <Text style={styles.value}>{editPragas || "-"}</Text>
          )}

          <Text style={styles.label}>Ações Realizadas:</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editAcoes}
              onChangeText={setEditAcoes}
            />
          ) : (
            <Text style={styles.value}>{editAcoes || "-"}</Text>
          )}

          <Text style={styles.label}>Observação:</Text>
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
              <Text style={styles.buttonText}>Deletar</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ marginTop: 20 }}>
          <Footer />
        </View>
      </ScrollView>

      {renderSimpleModal(
        modalRainhaVisible,
        setModalRainhaVisible,
        "Saúde da Rainha",
        opcoesRainha,
        setEditRainha
      )}
      {renderSimpleModal(
        modalForcaVisible,
        setModalForcaVisible,
        "Força da Colmeia",
        opcoesForca,
        setEditForca
      )}
      {renderModalColmeias()}
    </SafeAreaView>
  );
}
