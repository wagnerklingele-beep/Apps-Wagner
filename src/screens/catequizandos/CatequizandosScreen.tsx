import React, { useState, useMemo } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import Avatar from '../../components/Avatar';
import { Catequizando, RootStackParamList } from '../../types';

type Nav = StackNavigationProp<RootStackParamList>;

const TURMAS = ['Todas', '1ª Eucaristia', 'Crisma'];

function calcFrequencia(id: string, chamadas: ReturnType<typeof useApp>['chamadas']): number {
  const relevant = chamadas.filter(ch => ch.presencas.some(p => p.catequizandoId === id));
  if (relevant.length === 0) return 0;
  const presentes = relevant.filter(ch => ch.presencas.find(p => p.catequizandoId === id)?.presente).length;
  return Math.round((presentes / relevant.length) * 100);
}

export default function CatequizandosScreen() {
  const navigation = useNavigation<Nav>();
  const { catequizandos, chamadas } = useApp();
  const [busca, setBusca] = useState('');
  const [turmaFiltro, setTurmaFiltro] = useState('Todas');

  const filtered = useMemo(() => {
    return catequizandos
      .filter(c => c.ativo)
      .filter(c => turmaFiltro === 'Todas' || c.turma === turmaFiltro)
      .filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));
  }, [catequizandos, turmaFiltro, busca]);

  function renderItem({ item }: { item: Catequizando }) {
    const freq = calcFrequencia(item.id, chamadas);
    const freqColor = freq >= 75 ? Colors.success : freq >= 50 ? Colors.warning : Colors.error;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('CatequizandoDetalhe', { catequizando: item })}
        activeOpacity={0.75}
      >
        <Avatar name={item.nome} size={46} />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName}>{item.nome}</Text>
          <Text style={styles.cardTurma}>{item.turma}</Text>
          <Text style={styles.cardResp}>{item.responsavel} • {item.telefone}</Text>
        </View>
        <View style={styles.freqBadge}>
          <Text style={[styles.freqText, { color: freqColor }]}>{freq}%</Text>
          <Text style={styles.freqLabel}>freq.</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.notMarked} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Catequizandos</Text>
          <Text style={styles.headerSub}>{filtered.length} aluno{filtered.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AdicionarCatequizando')}
        >
          <Ionicons name="person-add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color="rgba(255,255,255,0.7)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nome..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={busca}
          onChangeText={setBusca}
        />
        {busca.length > 0 && (
          <TouchableOpacity onPress={() => setBusca('')}>
            <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        {TURMAS.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.filterChip, turmaFiltro === t && styles.filterChipActive]}
            onPress={() => setTurmaFiltro(t)}
          >
            <Text style={[styles.filterText, turmaFiltro === t && styles.filterTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB chamada */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Chamada', { turma: turmaFiltro === 'Todas' ? '1ª Eucaristia' : turmaFiltro, data: new Date().toISOString().split('T')[0] })}
      >
        <Ionicons name="checkmark-circle" size={24} color="#FFF" />
        <Text style={styles.fabText}>Fazer Chamada</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.primary },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: Spacing.md,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  searchInput: { flex: 1, color: '#FFF', fontSize: 15 },
  filterRow: {
    flexDirection: 'row',
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
  list: { padding: Spacing.md, backgroundColor: Colors.background, flexGrow: 1, paddingBottom: 88 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.small,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardTurma: { fontSize: 12, color: Colors.accent, fontWeight: '600', marginTop: 2 },
  cardResp: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  freqBadge: { alignItems: 'center' },
  freqText: { fontSize: 16, fontWeight: '800' },
  freqLabel: { fontSize: 10, color: Colors.textSecondary },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    left: 16,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.medium,
  },
  fabText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
