import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors, Spacing, Radius, Shadow } from '../theme';
import { useApp } from '../context/AppContext';
import { mockAgenda } from '../data/mockAgenda';
import { RootStackParamList } from '../types';

type Nav = StackNavigationProp<RootStackParamList>;

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', weekday: 'short' });
}

function getNextEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return mockAgenda
    .filter(e => {
      const [y, m, d] = e.data.split('-').map(Number);
      return new Date(y, m - 1, d) >= today;
    })
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 3);
}

const eventoColor: Record<string, string> = {
  aula: Colors.primary,
  sacramento: Colors.secondary,
  evento: Colors.accent,
  retiro: '#8E44AD',
  feriado: Colors.textSecondary,
};

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { catequizandos, comunicados, chamadas } = useApp();

  const ativos = catequizandos.filter(c => c.ativo);
  const eucaristia = ativos.filter(c => c.turma === '1ª Eucaristia');
  const crisma = ativos.filter(c => c.turma === 'Crisma');
  const unread = comunicados.filter(c => !c.lido).length;
  const lastChamada = chamadas.length > 0 ? chamadas[chamadas.length - 1] : null;
  const nextEvents = getNextEvents();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerGreeting}>Bem-vindo(a)</Text>
          <Text style={styles.headerTitle}>Catequese</Text>
        </View>
        <Ionicons name="heart" size={28} color={Colors.secondary} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <Text style={styles.sectionTitle}>Resumo</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: Colors.primary }]}>
            <Text style={styles.statNumber}>{ativos.length}</Text>
            <Text style={styles.statLabel}>Catequizandos</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: Colors.accent }]}>
            <Text style={styles.statNumber}>{eucaristia.length}</Text>
            <Text style={styles.statLabel}>1ª Eucaristia</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: Colors.secondary }]}>
            <Text style={styles.statNumber}>{crisma.length}</Text>
            <Text style={styles.statLabel}>Crisma</Text>
          </View>
        </View>

        {/* Ações rápidas */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Chamada', { turma: '1ª Eucaristia', data: new Date().toISOString().split('T')[0] })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8EFF7' }]}>
              <Ionicons name="checkmark-circle" size={26} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Chamada{'\n'}1ª Eucaristia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Chamada', { turma: 'Crisma', data: new Date().toISOString().split('T')[0] })}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FEF9E7' }]}>
              <Ionicons name="checkmark-circle" size={26} color={Colors.secondary} />
            </View>
            <Text style={styles.actionLabel}>Chamada{'\n'}Crisma</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('NovoComunicado')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#EAF4FB' }]}>
              <Ionicons name="megaphone" size={26} color={Colors.accent} />
            </View>
            <Text style={styles.actionLabel}>Novo{'\n'}Comunicado</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('AdicionarCatequizando')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#E8F7EE' }]}>
              <Ionicons name="person-add" size={26} color={Colors.success} />
            </View>
            <Text style={styles.actionLabel}>Adicionar{'\n'}Aluno</Text>
          </TouchableOpacity>
        </View>

        {/* Próximos eventos */}
        <Text style={styles.sectionTitle}>Próximos Eventos</Text>
        {nextEvents.map(evento => (
          <View key={evento.id} style={styles.eventCard}>
            <View style={[styles.eventDot, { backgroundColor: eventoColor[evento.tipo] }]} />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{evento.titulo}</Text>
              <Text style={styles.eventDate}>
                {formatDate(evento.data)}{evento.hora ? ` • ${evento.hora}` : ''}
                {evento.turma ? ` • ${evento.turma}` : ''}
              </Text>
            </View>
          </View>
        ))}

        {/* Avisos não lidos */}
        {unread > 0 && (
          <View style={styles.alertCard}>
            <Ionicons name="notifications" size={20} color={Colors.error} />
            <Text style={styles.alertText}>
              {unread} aviso{unread > 1 ? 's' : ''} não lido{unread > 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGreeting: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  headerTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '800' },
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 24 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    ...Shadow.small,
  },
  statNumber: { fontSize: 28, fontWeight: '800', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  actionBtn: {
    width: '22%',
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    ...Shadow.small,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  actionLabel: { fontSize: 11, color: Colors.text, textAlign: 'center', fontWeight: '500', lineHeight: 15 },
  eventCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...Shadow.small,
  },
  eventDot: { width: 10, height: 10, borderRadius: 5, marginTop: 5, marginRight: Spacing.sm },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  eventDate: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  alertCard: {
    backgroundColor: '#FDEDEC',
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    ...Shadow.small,
  },
  alertText: { fontSize: 14, color: Colors.error, fontWeight: '600' },
});
