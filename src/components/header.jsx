import React from "react";
import { View, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../theme/colors";

import { useTheme } from "../theme/ThemeContext";

export default function Header({ onMenuPress }) {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: theme.background,
    },
    logo: {
      width: 40,
      height: 40,
    },
    menuIcon: {
      width: 32,
      height: 32,
      tintColor: theme.text,
    },
  });

  return (
    <View style={styles.container}>
      {/* LADO ESQUERDO: Logo Clicável -> Vai para Home */}
      <TouchableOpacity
        onPress={() => navigation.navigate("HomePage")}
        activeOpacity={0.7}
      >
        <Image
          source={require("../../assets/icons/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* LADO DIREITO: Menu Hamburguer */}
      <TouchableOpacity onPress={onMenuPress} activeOpacity={0.7}>
        <Image
          source={require("../../assets/icons/Hamburger.png")}
          style={styles.menuIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
}


