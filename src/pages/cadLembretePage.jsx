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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Footer from "../components/footer";
import Header from "../components/header";
// import { colors } from "../theme/colors"; // REMOVIDO
import { useTheme } from "../theme/ThemeContext"; // IMPORTADO

// Biblioteca de Data
import DateTimePicker from "@react-native-community/datetimepicker";

// Firebase
import { db, auth } from "../firebase/firebaseConfig";
import { ref, push, set, onValue } from "firebase/database";

export default function CadLembretePage() {
  const navigation = useNavigation();
  const { theme } = useTheme(); // HOOK DO TEMA

  // --- Estados do Formulário ---
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  // Data (Calendário)
  const [date, setDate] = useState(new Date());
  const [dataTexto, setDataTexto] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Dropdown States
  const [apiariosList, setApiariosList] = useState([]);
  const [selectedApiario, setSelectedApiario] = useState(null);

  const [status, setStatus] = useState("Ativo");
  const [prioridade, setPrioridade] = useState("Média");

  // Colmeias (Multi-Select Inteligente)
  const [colmeiasList, setColmeiasList] = useState([]);
  const [selectedColmeias, setSelectedColmeias] = useState([]);
  const [textoColmeias, setTextoColmeias] = useState("");

  // Modais Control
  const [modalApiario, setModalApiario] = useState(false);
  const [modalColmeias, setModalColmeias] = useState(false);
  const [modalStatus, setModalStatus] = useState(false);
  const [modalPrioridade, setModalPrioridade] = useState(false);

  // Listas fixas
  const statusOptions = ["Ativo", "Concluído", "Cancelado"];
  const prioridadeOptions = ["Alta", "Média", "Baixa"];

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
    selectText: { fontSize: 16, color: theme.text, flex: 1, marginRight: 10 },
    placeholderText: { fontSize: 16, color: theme.textSecondary },
    arrowText: { fontSize: 16, color: theme.text },

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
          lista.push({ id: key, nome: value.nome });
        });
      }
      setApiariosList(lista);
    });
  }, []);

  // 2. Carregar Colmeias ao mudar Apiário
  useEffect(() => {
    setColmeiasList([]);
    setSelectedColmeias([]);
    setTextoColmeias("");

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
      });
    }
  }, [selectedApiario]);

  // 3. Atualizar texto das colmeias selecionadas
  useEffect(() => {
    if (selectedColmeias.length > 0) {
      const nomes = selectedColmeias.map((c) => c.nome).join(", ");
      setTextoColmeias(nomes);
    } else {
      setTextoColmeias("");
    }
  }, [selectedColmeias]);

  // Toggle Colmeia
  const toggleColmeia = (colmeia) => {
    const exists = selectedColmeias.find((c) => c.id === colmeia.id);
    if (exists) {
      setSelectedColmeias(selectedColmeias.filter((c) => c.id !== colmeia.id));
    } else {
      setSelectedColmeias([...selectedColmeias, colmeia]);
    }
  };

  // Calendário
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
    if (!user) return Alert.alert("Erro", "Usuário desconectado.");

    if (!titulo.trim()) return Alert.alert("Atenção", "Preencha o Título.");
    if (!descricao.trim())
      return Alert.alert("Atenção", "Preencha a Descrição.");
    if (!dataTexto) return Alert.alert("Atenção", "Preencha a Data.");

    try {
      const novoLembrete = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        dataLembrete: dataTexto,

        apiarioId: selectedApiario ? selectedApiario.id : null,
        apiarioNome: selectedApiario ? selectedApiario.nome : null,

        // Salva Texto e IDs
        colmeiasRelacionadas: textoColmeias,
        colmeiasIds: selectedColmeias.map((c) => c.id),

        status: status,
        prioridade: prioridade,
        dataCadastro: Date.now(),
      };

      const refDb = ref(db, `usuarios/${user.uid}/lembretes`);
      const novoReg = push(refDb);
      await set(novoReg, novoLembrete);

      Alert.alert("Sucesso", "Lembrete criado!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar.");
    }
  };

  // Modais Genéricos
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

  // Modal Multi-Select Colmeias
  const renderModalColmeias = () => (
    <Modal visible={modalColmeias} animationType="slide" transparent={true}>
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
            onPress={() => setModalColmeias(false)}
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
          <Text style={styles.pageTitle}>+ Novo Lembrete</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subText}>Campos com * são obrigatórios</Text>

        <View style={styles.form}>
          {/* APIÁRIO */}
          <Text style={styles.label}>Apiário (opcional)</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setModalApiario(true)}
          >
            <Text
              style={
                selectedApiario ? styles.selectText : styles.placeholderText
              }
            >
              {selectedApiario ? selectedApiario.nome : "Selecione um apiário"}
            </Text>
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>

          {/* COLMEIAS MULTI-SELECT */}
          <Text style={styles.label}>Colmeia(s) relacionadas (opcional)</Text>
          <TouchableOpacity
            style={[
              styles.selectButton,
              !selectedApiario && { opacity: 0.5 }, // Opacidade para indicar desabilitado
            ]}
            onPress={() => {
              if (!selectedApiario)
                Alert.alert("Aviso", "Selecione um apiário primeiro.");
              else setModalColmeias(true);
            }}
          >
            <Text
              style={textoColmeias ? styles.selectText : styles.placeholderText}
              numberOfLines={1}
            >
              {textoColmeias || "Selecione as colmeias..."}
            </Text>
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>

          {/* CAMPOS PADRÃO */}
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ex: Troca de quadros"
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={styles.input}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Detalhes do lembrete"
            placeholderTextColor={theme.textSecondary}
          />

          {/* DATA */}
          <Text style={styles.label}>Data do lembrete *</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={dataTexto ? styles.selectText : styles.placeholderText}
            >
              {dataTexto || "dd/mm/aaaa"}
            </Text>
            <Text style={{ fontSize: 18, color: theme.text }}>📅</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={onChangeDate}
              minimumDate={new Date()}
            />
          )}

          {/* STATUS */}
          <Text style={styles.label}>Status</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setModalStatus(true)}
          >
            <Text style={styles.selectText}>{status}</Text>
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>

          {/* PRIORIDADE */}
          <Text style={styles.label}>Prioridade</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setModalPrioridade(true)}
          >
            <Text style={styles.selectText}>{prioridade}</Text>
            <Text style={styles.arrowText}>▼</Text>
          </TouchableOpacity>
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

      {/* Renders dos Modais */}
      {renderSimpleModal(
        modalApiario,
        setModalApiario,
        "Escolha um Apiário",
        apiariosList,
        setSelectedApiario,
        (item) => item.nome
      )}
      {renderSimpleModal(
        modalStatus,
        setModalStatus,
        "Selecione o Status",
        statusOptions,
        setStatus
      )}
      {renderSimpleModal(
        modalPrioridade,
        setModalPrioridade,
        "Selecione a Prioridade",
        prioridadeOptions,
        setPrioridade
      )}

      {renderModalColmeias()}
    </SafeAreaView>
  );
}
