import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// --- Importação das Páginas ---

// Autenticação
import LoginPage from "../pages/loginPage";
import CadUserPage from "../pages/cadUserPage";

// Home, Menu e Perfil
import HomePage from "../pages/homePage";
import MenuPage from "../pages/menuPage";
import UserPage from "../pages/userPage"; // <--- IMPORTANTE: Adicionado aqui!

// Apiários
import ApiariosPage from "../pages/apiariosPage";
import CadApiarioPage from "../pages/cadApiarioPage";
import ApiarioInfoPage from "../pages/apiarioInfoPage";

// Colmeias
import ColmeiasPage from "../pages/colmeiasPage";
import CadColmeiaPage from "../pages/cadColmeiaPage";
import ColmeiaInfoPage from "../pages/colmeiaInfoPage";

// Produção
import ProducaoPage from "../pages/producaoPage";
import CadProducaoPage from "../pages/cadProducaoPage";
import ProducaoInfoPage from "../pages/producaoInfoPage";

// Inspeção
import InspecoesPage from "../pages/inspecoesPage";
import CadInspecaoPage from "../pages/cadInspecaoPage";
import InspecaoInfoPage from "../pages/inspecaoInfoPage";

// Lembretes
import LembretesPage from "../pages/lembretesPage";
import CadLembretePage from "../pages/cadLembretePage";
import LembreteInfoPage from "../pages/lembreteInfoPage";
//sobre
import SobrePage from "../pages/sobrePage";

const Stack = createNativeStackNavigator();

export default function StackRoutes() {
  return (
    <Stack.Navigator initialRouteName="LoginPage">
      {/* --- Auth --- */}
      <Stack.Screen
        name="LoginPage"
        component={LoginPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CadUserPage"
        component={CadUserPage}
        options={{ headerShown: false }}
      />

      {/* --- Core (Home, Menu, Perfil) --- */}
      <Stack.Screen
        name="HomePage"
        component={HomePage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MenuPage"
        component={MenuPage}
        options={{ headerShown: false, presentation: "modal" }}
      />

      
      <Stack.Screen
        name="UserPage"
        component={UserPage}
        options={{ headerShown: false }}
      />

      {/* --- Apiários --- */}
      <Stack.Screen
        name="ApiariosPage"
        component={ApiariosPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CadApiarioPage"
        component={CadApiarioPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ApiarioInfoPage"
        component={ApiarioInfoPage}
        options={{ headerShown: false }}
      />

      {/* --- Colmeias --- */}
      <Stack.Screen
        name="ColmeiasPage"
        component={ColmeiasPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CadColmeiaPage"
        component={CadColmeiaPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ColmeiaInfoPage"
        component={ColmeiaInfoPage}
        options={{ headerShown: false }}
      />

      {/* --- Produção --- */}
      <Stack.Screen
        name="ProducaoPage"
        component={ProducaoPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CadProducaoPage"
        component={CadProducaoPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ProducaoInfoPage"
        component={ProducaoInfoPage}
        options={{ headerShown: false }}
      />

      {/* --- Inspeção --- */}
      <Stack.Screen
        name="InspecaoPage"
        component={InspecoesPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CadInspecaoPage"
        component={CadInspecaoPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InspecaoInfoPage"
        component={InspecaoInfoPage}
        options={{ headerShown: false }}
      />

      {/* --- Lembretes --- */}
      <Stack.Screen
        name="LembretesPage"
        component={LembretesPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CadLembretePage"
        component={CadLembretePage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LembreteInfoPage"
        component={LembreteInfoPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SobrePage"
        component={SobrePage}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
