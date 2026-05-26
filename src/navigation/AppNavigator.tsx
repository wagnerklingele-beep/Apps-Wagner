import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing } from '../theme';
import { RootStackParamList, TabParamList } from '../types';

import HomeScreen from '../screens/HomeScreen';
import LicoesScreen from '../screens/licoes/LicoesScreen';
import LicaoDetalheScreen from '../screens/licoes/LicaoDetalheScreen';
import CatequizandosScreen from '../screens/catequizandos/CatequizandosScreen';
import CatequizandoDetalheScreen from '../screens/catequizandos/CatequizandoDetalheScreen';
import AdicionarCatequizandoScreen from '../screens/catequizandos/AdicionarCatequizandoScreen';
import ChamadaScreen from '../screens/chamada/ChamadaScreen';
import AgendaScreen from '../screens/agenda/AgendaScreen';
import ComunicadosScreen from '../screens/comunicados/ComunicadosScreen';
import NovoComunicadoScreen from '../screens/comunicados/NovoComunicadoScreen';
import { useApp } from '../context/AppContext';

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}

function MainTabs() {
  const { comunicados } = useApp();
  const unreadCount = comunicados.filter(c => !c.lido).length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.notMarked,
        tabBarStyle: {
          backgroundColor: Colors.tabBarBg,
          borderTopColor: Colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Licoes"
        component={LicoesScreen}
        options={{
          tabBarLabel: 'Lições',
          tabBarIcon: ({ color, size }) => <Ionicons name="book" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Catequizandos"
        component={CatequizandosScreen}
        options={{
          tabBarLabel: 'Turmas',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaScreen}
        options={{
          tabBarLabel: 'Agenda',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Comunicados"
        component={ComunicadosScreen}
        options={{
          tabBarLabel: 'Avisos',
          tabBarIcon: ({ color, size, focused }) => (
            <View>
              <Ionicons name="notifications" size={size} color={color} />
              <TabBadge count={unreadCount} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="LicaoDetalhe" component={LicaoDetalheScreen} options={({ route }) => ({ title: route.params.licao.titulo })} />
      <Stack.Screen name="CatequizandoDetalhe" component={CatequizandoDetalheScreen} options={({ route }) => ({ title: route.params.catequizando.nome.split(' ')[0] })} />
      <Stack.Screen name="AdicionarCatequizando" component={AdicionarCatequizandoScreen} options={{ title: 'Novo Catequizando' }} />
      <Stack.Screen name="Chamada" component={ChamadaScreen} options={({ route }) => ({ title: `Chamada — ${route.params.turma}` })} />
      <Stack.Screen name="NovoComunicado" component={NovoComunicadoScreen} options={{ title: 'Novo Comunicado' }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
