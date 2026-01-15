import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from "../theme/ThemeContext";
export default function Footer() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
  container: {
    width: '100%', // Garante que ocupe a largura disponível
    paddingHorizontal: 20, // A MÁGICA: Adiciona margem interna para não colar na borda
    paddingVertical: 20,
    marginTop: 'auto', // Ajuda a empurrar para baixo se o conteúdo for curto
  },
  divider: {
    height: 1,
    backgroundColor: theme.primary,
    marginBottom: 15,
    width: '100%', 
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: theme.textSecondary,
    paddingVertical: 5,
  }
});

  return (
    <View style={styles.container}>
      {/* Linha divisória */}
      <View style={styles.divider} />
      
      <Text style={styles.title}>Links úteis</Text>
      
      <TouchableOpacity onPress={() => navigation.navigate('SobrePage')} activeOpacity={0.7}>
        <Text style={styles.link}>Sobre nós</Text>
      </TouchableOpacity>
      
      {/* Versão removida conforme solicitado */}
    </View>
  );
}

