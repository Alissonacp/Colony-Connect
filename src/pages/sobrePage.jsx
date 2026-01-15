import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Footer from "../components/footer";
import Header from "../components/header";
import { useTheme } from "../theme/ThemeContext";

export default function SobrePage() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },

    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
      marginTop: 10,
    },
    backIcon: { width: 24, height: 24, tintColor: theme.text },
    pageTitle: { fontSize: 22, fontWeight: "bold", color: theme.text },

    contentArea: { marginTop: 10 },

    purpleTitle: { color: theme.primary, fontSize: 16, fontWeight: "bold" },
    blackSubtitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 20,
    },

    purpleSectionTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "bold",
      marginTop: 25,
      marginBottom: 15,
    },

    paragraph: {
      color: theme.text,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 15,
      textAlign: "justify",
    },
    italicText: { marginTop: 10, fontStyle: "italic" },

    sectionDivider: {
      height: 1,
      backgroundColor: "#E0E0E0",
      marginVertical: 10,
    },

    bulletContainer: {
      flexDirection: "row",
      marginBottom: 12,
      paddingRight: 10,
    },
    bullet: { fontSize: 20, color: theme.textSobre, marginRight: 10, lineHeight: 22 },
    bulletText: {
      fontSize: 15,
      color: theme.textSobre,
      lineHeight: 22,
      flex: 1,
      textAlign: "justify",
    },
  });

  // Componente interno para os itens da lista
  const BulletPoint = ({ text }) => {
    return (
      <View style={styles.bulletContainer}>
        <Text style={styles.bullet}>{"\u2022"}</Text>
        <Text style={styles.bulletText}>{text}</Text>
      </View>
    );
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
          <Text style={styles.pageTitle}>Sobre nós</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.contentArea}>
          <Text style={styles.purpleTitle}>Colony Connect</Text>
          <Text style={styles.blackSubtitle}>
            para fortalecer a apicultura familiar
          </Text>

          <Text style={styles.paragraph}>
            O Colony Connect é um aplicativo criado para ajudar os apicultores
            do sertão cearense a organizarem melhor sua produção e tornarem o
            trabalho com as abelhas mais eficiente e sustentável.
          </Text>

          <Text style={styles.paragraph}>
            A gente sabe o quanto a apicultura é importante para muitas famílias
            do Ceará, uma fonte de renda, mas também uma forma de manter viva
            uma tradição. Ao mesmo tempo, entendemos que os pequenos produtores
            enfrentam muitos desafios no dia a dia.
          </Text>

          <Text style={styles.paragraph}>
            Nosso propósito é simples: levar ferramentas tecnológicas que ajudem
            o apicultor familiar a trabalhar de forma mais prática, profissional
            e lucrativa, sem perder sua essência.
          </Text>

          <View style={styles.sectionDivider} />
          <Text style={styles.purpleSectionTitle}>
            O problema que queremos resolver
          </Text>

          <Text style={styles.paragraph}>
            Mesmo sendo uma atividade cheia de potencial, a apicultura familiar
            ainda enfrenta dificuldades na gestão de alguns processos.
          </Text>
          <Text style={styles.paragraph}>
            Alguns dos principais desafios são:
          </Text>

          <BulletPoint text="Falta de registros: muitos apicultores ainda não anotam informações sobre suas colmeias e produções, o que dificulta saber o quanto cada colmeia rende e quais custos estão envolvidos." />
          <BulletPoint text="Baixo uso de tecnologia: poucas ferramentas digitais são usadas para planejar, controlar ou acompanhar os resultados da produção." />
          <BulletPoint text="Risco à sustentabilidade: sem uma boa gestão, o negócio pode ficar menos competitivo e mais difícil de manter a longo prazo." />

          <Text style={styles.purpleSectionTitle}>
            Como o Colony Connect ajuda?
          </Text>

          <Text style={styles.paragraph}>
            O Colony Connect facilita o controle da produção apícola por meio de
            uma plataforma simples, intuitiva e pensada para funcionar até em
            regiões com internet limitada.
          </Text>
          <Text style={styles.paragraph}>Com ele, o apicultor pode:</Text>

          <BulletPoint text="Gerenciar apiários e colmeias: registrar e acompanhar os dados de cada unidade produtiva." />
          <BulletPoint text="Registrar inspeções e manejos: anotar tudo o que foi feito em cada colmeia." />
          <BulletPoint text="Controlar a produção: acompanhar as colheitas e o volume de produtos apícolas." />
          <BulletPoint text="Organizar tarefas: definir lembretes e programar atividades importantes para o manejo." />

          <Text style={[styles.paragraph, styles.italicText]}>
            Com essas ferramentas, o produtor passa a ter um controle mais claro
            do seu trabalho, dos custos e da produção, um passo importante para
            crescer com mais confiança e sustentabilidade.
          </Text>
        </View>
      </ScrollView>
      <Footer />
    </SafeAreaView>
  );
}
