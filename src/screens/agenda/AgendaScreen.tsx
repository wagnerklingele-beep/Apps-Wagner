import React, { useState, useMemo } from 'react';
import {
  View, Text, SectionList, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import { mockAgenda } from '../../data/mockAgenda';
import { EventoAgenda } from '../../types';

const TIPO_CONFIG: Record<string, { color: string; icon: string; label: string }> = {
  aula: { color: Colors.primary, icon: 'school', label: 'Aula' },
  sacramento: { color: Colors.secondary, icon: 'star', label: 'Sacramento' },
  evento: { color: Colors.accent, icon: 'people', label: 'Evento' },
  retiro: { color: '#8E44AD', icon: 'compass', label: 'Retiro' },
  feriado: { color: Colors.textSecondary, icon: 'calendar', label: 'Feriado' },
};

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function formatSectionTitle(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dia = date.toLocaleDateString('pt-BR', { weekday: 'long' });
  return `${d} de ${MESES[m - 1]} de ${y} • ${dia.charAt(0).toUpperCase() + dia.slice(1)}`;
}

function groupEventosByDate(eventos: EventoAgenda[]) {
  const groups: Record<string, EventoAgenda[]> = {};
  eventos.forEach(e => {
    if (!groups[e.data]) groups[e.data] = [];
    groups[e.data].push(e);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({ title: date, data }));
}

function isToday(dateStr: string) {
  const today = new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  return today.getFullYear() === y && today.getMonth() + 1 === m && today.getDate() === d;
}

function isPast(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d) < today;
}

const FILTROS = ['Todos', 'Aulas', 'Sacramentos', 'Eventos'];
const FILTRO_MAP: Record<string, string[]> = {
  'Todos': [],
  'Aulas': ['aula'],
  'Sacramentos': ['sacramento'],
  'Eventos': ['evento', 'retiro', 'feriado'],
};

export default function AgendaScreen() {
  const [filtro, setFiltro] = useState('Todos');

  const sections = useMemo(() => {
    const tiposFiltro = FILTRO_MAP[filtro];
    const eventos = tiposFiltro.length > 0
      ? mockAgenda.filter(e => tiposFiltro.includes(e.tipo))
      : mockAgenda;
    return groupEventosByDate(eventos);
  }, [filtro]);

  function renderEvento({ item }: { item: EventoAgenda }) {
    const cfg = TIPO_CONFIG[item.tipo];
    const past = isPast(item.data) && !isToday(item.data);
    return (
      <View style={[styles.eventoCard, past && styles.eventoCardPast]}>
        <View style={[styles.eventoIconCircle, { backgroundColor: past ? Colors.border : cfg.color }]}>
          <Ionicons name={cfg.icon as any} size={18} color={past ? Colors.textSecondary : '#FFF'} />
        </View>
        <View style={styles.eventoInfo}>
          <Text style={[styles.eventoTitulo, past && styles.textPast]}>{item.titulo}</Text>
          {item.hora && (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={13} color={past ? Colors.notMarked : Colors.textSecondary} />
              <Text style={[styles.metaText, past && styles.textPast]}>{item.hora}</Text>
              {item.turma && <Text style={[styles.metaText, past && styles.textPast]}> • {item.turma}</Text>}
            </View>
          )}
          {item.descricao && (
            <Text style={[styles.eventoDesc, past && styles.textPast]} numberOfLines={2}>{item.descricao}</Text>
          )}
        </View>
        <View style={[styles.tipoBadge, { backgroundColor: past ? Colors.background : `${cfg.color}20` }]}>
          <Text style={[styles.tipoText, { color: past ? Colors.notMarked : cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agenda</Text>
        <Text style={styles.headerSub}>{mockAgenda.length} eventos</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTROS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filtro === f && styles.filterChipActive]}
            onPress={() => setFiltro(f)}
          >
            <Text style={[styles.filterText, filtro === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        renderItem={renderEvento}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, isToday(title) && styles.sectionHeaderToday]}>
            {isToday(title) && (
              <View style={styles.todayBadge}>
                <Text style={styles.todayText}>HOJE</Text>
              </View>
            )}
            <Text style={[styles.sectionTitle, isToday(title) && styles.sectionTitleToday]}>
              {formatSectionTitle(title)}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
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
  },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  filterRow: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  filterChipActive: { backgroundColor: '#FFFFFF' },
  filterText: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: Colors.primary },
  list: { padding: Spacing.md, backgroundColor: Colors.background, flexGrow: 1, paddingBottom: 24 },
  sectionHeader: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionHeaderToday: {},
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, textTransform: 'capitalize' },
  sectionTitleToday: { color: Colors.primary },
  todayBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  todayText: { color: '#FFF', fontSize: 10, fontWeight: '800' },
  eventoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    ...Shadow.small,
  },
  eventoCardPast: { opacity: 0.65 },
  eventoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventoInfo: { flex: 1 },
  eventoTitulo: { fontSize: 15, fontWeight: '700', color: Colors.text },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  eventoDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  tipoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  tipoText: { fontSize: 11, fontWeight: '700' },
  textPast: { color: Colors.notMarked },
});
