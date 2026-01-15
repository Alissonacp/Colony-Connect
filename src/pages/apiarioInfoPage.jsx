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
  FlatList, // Mantive caso precise no futuro, mas estamos usando map
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import Footer from "../components/footer";
import Header from "../components/header";
// import { colors } from "../theme/colors"; // REMOVIDO: Agora usamos o theme
import { useTheme } from "../theme/ThemeContext"; // IMPORTADO

// Biblioteca de Data
import DateTimePicker from "@react-native-community/datetimepicker";

import { db, auth } from "../firebase/firebaseConfig";
import { ref, update, remove, onValue } from "firebase/database";

export default function ApiarioInfoPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { theme } = useTheme(); // HOOK DO TEMA

  // Dados do Apiário
  const { apiario } = route.params;

  const [isEditing, setIsEditing] = useState(false);

  // Estados do Formulário
  const [editNome, setEditNome] = useState(apiario.nome);
  const [editDataTexto, setEditDataTexto] = useState(apiario.dataInstalacao);
  const [editLocalizacao, setEditLocalizacao] = useState(apiario.localizacao);
  const [editObs, setEditObs] = useState(apiario.observacao || "");

  // Estado das Colmeias (Lista Real)
  const [colmeiasList, setColmeiasList] = useState([]);

  // Estados do Calendário
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // --- ESTILOS MOVIDOS PARA DENTRO (Para acessar o theme) ---
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

    qtdBox: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      marginBottom: 10,
    },
    qtdValue: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.primary,
      marginLeft: 10,
    },

    listContainer: { marginTop: 10 },

    // ESTILO DO CARD DA COLMEIA ATUALIZADO
    colmeiaItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.cardBackground, // Adaptável ao tema
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },
    colmeiaIconList: {
      width: 20,
      height: 20,
      marginRight: 10,
      tintColor: theme.primary,
    },
    colmeiaName: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.text,
      flex: 1,
    },
    colmeiaType: { fontSize: 14, color: theme.textSecondary, marginRight: 10 },
    emptyText: {
      color: theme.textSecondary,
      fontStyle: "italic",
      marginTop: 5,
      marginBottom: 10,
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
    selectText: { fontSize: 16, color: theme.text },
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
      backgroundColor: theme.cardBackground, // No dark mode não pode ser white fixo
      borderWidth: 1,
      borderColor: theme.textSecondary,
      borderRadius: 25,
      paddingVertical: 15,
      alignItems: "center",
      marginBottom: 20,
    },
    buttonText: { color: theme.white, fontWeight: "bold", fontSize: 16 },
    cancelText: { color: theme.text, fontWeight: "bold", fontSize: 16 },
  });

  const getApiarioRef = () => {
    const user = auth.currentUser;
    if (!user) return null;
    return ref(db, `usuarios/${user.uid}/apiarios/${apiario.id}`);
  };

  // --- BUSCAR COLMEIAS EM TEMPO REAL ---
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    // Caminho das colmeias DENTRO deste apiário
    const colmeiasRef = ref(
      db,
      `usuarios/${user.uid}/apiarios/${apiario.id}/colmeias`
    );

    onValue(colmeiasRef, (snapshot) => {
      const data = snapshot.val();
      let lista = [];
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          lista.push({ id: key, ...value });
        });
      }
      setColmeiasList(lista);
    });
  }, []);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = selectedDate.toLocaleDateString("pt-BR");
      setEditDataTexto(formattedDate);
    }
  };

  const handleSave = async () => {
    const apiarioRef = getApiarioRef();
    if (!apiarioRef) return Alert.alert("Erro", "Erro de referência.");

    try {
      await update(apiarioRef, {
        nome: editNome,
        dataInstalacao: editDataTexto,
        localizacao: editLocalizacao,
        observacao: editObs,
        ultimaAtualizacao: Date.now(),
      });

      Alert.alert("Sucesso", "Apiário atualizado!");
      setIsEditing(false);

      apiario.nome = editNome;
      apiario.dataInstalacao = editDataTexto;
      apiario.localizacao = editLocalizacao;
      apiario.observacao = editObs;
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar.");
    }
  };

  const handleDelete = () => {
    const apiarioRef = getApiarioRef();
    Alert.alert(
      "Deletar",
      "Tem certeza? Todas as colmeias deste apiário também serão apagadas.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Deletar",
          style: "destructive",
          onPress: async () => {
            try {
              await remove(apiarioRef);
              navigation.goBack();
            } catch (e) {
              Alert.alert("Erro", "Falha ao deletar.");
            }
          },
        },
      ]
    );
  };

  // --- LISTA CLICÁVEL COM TEMA ---
  const renderColmeiaItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.colmeiaItem}
      onPress={() => {
        const colmeiaCompleta = {
          ...item,
          apiarioId: apiario.id,
          apiarioNome: apiario.nome,
        };
        navigation.navigate("ColmeiaInfoPage", { colmeia: colmeiaCompleta });
      }}
    >
      <Image
        source={require("../../assets/icons/colmeias.png")}
        style={styles.colmeiaIconList}
      />
      <Text style={styles.colmeiaName}>{item.nome}</Text>
      <Text style={styles.colmeiaType}>{item.tipo}</Text>
      {/* Ícone de seta */}
      <Image
        source={require("../../assets/icons/seta_direita.svg")}
        style={{ width: 16, height: 16, tintColor: theme.textSecondary }} // Ajustado para theme
        resizeMode="contain"
      />
    </TouchableOpacity>
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
              source={require("../../assets/icons/apiarios.png")}
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
          <Text style={styles.label}>Nome *</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editNome}
              onChangeText={setEditNome}
              placeholderTextColor={theme.textSecondary} // Importante para placeholders
            />
          ) : (
            <Text style={styles.value}>{editNome}</Text>
          )}

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

          <View style={styles.qtdBox}>
            <Text style={styles.label}>Quantidade de Colmeias:</Text>
            <Text style={styles.qtdValue}>{colmeiasList.length}</Text>
          </View>

          <Text style={styles.label}>Localização *</Text>
          {isEditing ? (
            <TextInput
              style={styles.input}
              value={editLocalizacao}
              onChangeText={setEditLocalizacao}
              placeholderTextColor={theme.textSecondary}
            />
          ) : (
            <Text style={styles.value}>{editLocalizacao}</Text>
          )}

          <Text style={styles.label}>Observação</Text>
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

          {/* --- LISTA DE COLMEIAS --- */}
          <Text
            style={[
              styles.label,
              {
                marginTop: 25,
                fontSize: 18,
                borderTopWidth: 1,
                borderTopColor: theme.inputBorder, // Ajustado para theme
                paddingTop: 15,
              },
            ]}
          >
            Colmeias deste Apiário
          </Text>

          {colmeiasList.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma colmeia cadastrada.</Text>
          ) : (
            <View style={styles.listContainer}>
              {colmeiasList.map((item) => renderColmeiaItem(item))}
            </View>
          )}
        </View>

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
              <Text style={styles.buttonText}>Deletar Apiário</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ marginTop: 20 }}>
          <Footer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
