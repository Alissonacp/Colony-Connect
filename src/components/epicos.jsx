import React from 'react';
import { Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';


const { width } = Dimensions.get('window');
const cardSize = (width - 80) / 2; // (Tela - margens) / 2 colunas

export default function HomeCard({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={[styles.card, { width: cardSize, height: cardSize }]} onPress={onPress} activeOpacity={0.7}>
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#481b91ff',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    
    
    elevation: 5,
    shadowColor: '#242125ff', 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  icon: {
    width: '45%',
    height: '45%',
    tintColor: '#fff',
    marginBottom: 10,
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
});