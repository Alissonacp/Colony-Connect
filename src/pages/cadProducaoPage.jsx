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

// Biblioteca de Calendário
import DateTimePicker from "@react-native-community/datetimepicker";

// Firebase
import { db, auth } from "../firebase/firebaseConfig";
import { ref, push, set, onValue } from "firebase/database";

export default function CadProducaoPage() {
  const navigation = useNavigation();
  const { theme } = useTheme(); // HOOK DO TEMA

  // Estados dos Campos
  const [nome, setNome] = useState("");
  const [produto, setProduto] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [obs, setObs] = useState("");

  // Estados de Data
  const [date, setDate] = useState(new Date());
  const [dataTexto, setDataTexto] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Estados de Apiário
  const [apiariosList, setApiariosList] = useState([]);
  const [selectedApiario, setSelectedApiario] = useState(null);
  const [modalApiarioVisible, setModalApiarioVisible] = useState(false);

  // Estados de Colmeias (Multi-seleção)
  const [colmeiasList, setColmeiasList] = useState([]);
  const [selectedColmeias, setSelectedColmeias] = useState([]);
  const [modalColmeiasVisible, setModalColmeiasVisible] = useState(false);
  const [textoColmeias, setTextoColmeias] = useState("");

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

  // 1. Carregar Lista de Apiários
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

  // 2. Carregar Colmeias quando o Apiário muda
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

  // 3. Atualiza o texto do input
  useEffect(() => {
    if (selectedColmeias.length > 0) {
      const nomes = selectedColmeias.map((c) => c.nome).join(", ");
      setTextoColmeias(nomes);
    } else {
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
      setDataTexto(formattedDate);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Erro", "Usuário não logado.");

    if (!nome.trim()) return Alert.alert("Atenção", "Preencha o Nome.");
    if (!dataTexto) return Alert.alert("Atenção", "Selecione a Data.");
    if (!selectedApiario) return Alert.alert("Atenção", "Selecione o Apiário.");
    if (!produto.trim()) return Alert.alert("Atenção", "Preencha o Produto.");
    if (!quantidade.trim())
      return Alert.alert("Atenção", "Preencha a Quantidade.");

    try {
      const novaProducao = {
        nome: nome.trim(),
        dataProducao: dataTexto,
        apiarioId: selectedApiario.id,
        apiarioNome: selectedApiario.nome,
        colmeiaEnvolvida: textoColmeias,
        colmeiasIds: selectedColmeias.map((c) => c.id),
        produto: produto.trim(),
        quantidade: quantidade.trim(),
        observacao: obs.trim(),
        dataCadastro: Date.now(),
      };

      const producaoRef = ref(db, `usuarios/${user.uid}/producoes`);
      const novoReg = push(producaoRef);
      await set(novoReg, novaProducao);

      Alert.alert("Sucesso", "Produção registrada!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar.");
    }
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
              Nenhuma colmeia encontrada neste apiário.
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
            <Text style={styles.saveText}>
              Confirmar Seleção ({selectedColmeias.length})
            </Text>
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
          <Text style={styles.pageTitle}>+ Nova Produção</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.subText}>Campos com * são obrigatórios</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Produção 01"
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={styles.label}>Data da produção *</Text>
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

          <Text style={styles.label}>Colmeia(s) envolvida(s)</Text>
          <TouchableOpacity
            style={[
              styles.selectButton,
              !selectedApiario && { opacity: 0.5 }, // Opacidade para desabilitado
            ]}
            onPress={() => {
              if (!selectedApiario)
                Alert.alert("Aviso", "Selecione um apiário primeiro.");
              else setModalColmeiasVisible(true);
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

          <Text style={styles.label}>Produto(s) *</Text>
          <TextInput
            style={styles.input}
            value={produto}
            onChangeText={setProduto}
            placeholder="Ex: Mel, Cera, Própolis"
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={styles.label}>Quantidade Produzida *</Text>
          <TextInput
            style={styles.input}
            value={quantidade}
            onChangeText={setQuantidade}
            placeholder="Ex: 3kg, 5 Litros"
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={styles.label}>Observação</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
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

      {renderModalApiario()}
      {renderModalColmeias()}
    </SafeAreaView>
  );
}
