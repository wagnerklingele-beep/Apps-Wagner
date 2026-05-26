import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import { mockLicoes } from '../../data/mockLicoes';
import { Licao, RootStackParamList } from '../../types';

type Nav = StackNavigationProp<RootStackParamList>;

const FASES = ['Todas', '1ª Eucaristia', 'Crisma'];

export default function LicoesScreen() {
  const navigation = useNavigation<Nav>();
  const [faseFiltro, setFaseFiltro] = useState('Todas');

  const filtered = faseFiltro === 'Todas'
    ? mockLicoes
    : mockLicoes.filter(l => l.fase === faseFiltro);

  function renderLicao({ item }: { item: Licao }) {
    const isCrisma = item.fase === 'Crisma';
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('LicaoDetalhe', { licao: item })}
        activeOpacity={0.75}
      >
        <View style={[styles.numBadge, { backgroundColor: isCrisma ? Colors.secondary : Colors.primary }]}>
          <Text style={styles.numText}>{item.numero}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardTitle}>{item.titulo}</Text>
          <Text style={styles.cardFase}>{item.fase}</Text>
          <Text style={styles.cardObj} numberOfLines={2}>{item.objetivo}</Text>
          <View style={styles.cardMeta}>
            <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{item.duracao} min</Text>
            {item.versiculoBiblico && (
              <>
                <Ionicons name="book-outline" size={13} color={Colors.textSecondary} style={{ marginLeft: 8 }} />
                <Text style={styles.metaText}>Versículo</Text>
              </>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.notMarked} />
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lições</Text>
        <Text style={styles.headerSub}>{filtered.length} lição{filtered.length !== 1 ? 'ões' : ''}</Text>
      </View>

      <View style={styles.filterRow}>
        {FASES.map(fase => (
          <TouchableOpacity
            key={fase}
            style={[styles.filterChip, faseFiltro === fase && styles.filterChipActive]}
            onPress={() => setFaseFiltro(fase)}
          >
            <Text style={[styles.filterText, faseFiltro === fase && styles.filterTextActive]}>
              {fase}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderLicao}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
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
  list: { padding: Spacing.md, backgroundColor: Colors.background, flexGrow: 1 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadow.small,
  },
  numBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  numText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  cardFase: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cardObj: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 18 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  metaText: { fontSize: 12, color: Colors.textSecondary },
});
