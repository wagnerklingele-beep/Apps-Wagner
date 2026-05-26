import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import { RootStackParamList } from '../../types';

type Route = RouteProp<RootStackParamList, 'LicaoDetalhe'>;

type Section = 'conteudo' | 'oracao' | 'atividade';

const SECTIONS: { key: Section; label: string; icon: string }[] = [
  { key: 'conteudo', label: 'Conteúdo', icon: 'document-text' },
  { key: 'oracao', label: 'Oração', icon: 'heart' },
  { key: 'atividade', label: 'Atividade', icon: 'pencil' },
];

export default function LicaoDetalheScreen() {
  const { params: { licao } } = useRoute<Route>();
  const [activeSection, setActiveSection] = useState<Section>('conteudo');

  const isCrisma = licao.fase === 'Crisma';
  const accentColor = isCrisma ? Colors.secondary : Colors.primary;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Cabeçalho da lição */}
      <View style={[styles.heroCard, { borderLeftColor: accentColor }]}>
        <View style={[styles.numCircle, { backgroundColor: accentColor }]}>
          <Text style={styles.numText}>{licao.numero}</Text>
        </View>
        <View style={styles.heroInfo}>
          <Text style={styles.heroFase}>{licao.fase}</Text>
          <Text style={styles.heroTitle}>{licao.titulo}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.metaText}>{licao.duracao} minutos</Text>
          </View>
        </View>
      </View>

      {/* Objetivo */}
      <View style={styles.objetivoCard}>
        <Text style={styles.objetivoLabel}>Objetivo da Lição</Text>
        <Text style={styles.objetivoText}>{licao.objetivo}</Text>
      </View>

      {/* Versículo bíblico */}
      {licao.versiculoBiblico && (
        <View style={[styles.versiculoCard, { borderColor: accentColor }]}>
          <Ionicons name="book" size={18} color={accentColor} />
          <Text style={[styles.versiculoText, { color: accentColor }]}>
            {licao.versiculoBiblico}
          </Text>
        </View>
      )}

      {/* Tabs de seções */}
      <View style={styles.tabRow}>
        {SECTIONS.map(s => {
          if (s.key === 'oracao' && !licao.oracao) return null;
          if (s.key === 'atividade' && !licao.atividade) return null;
          return (
            <TouchableOpacity
              key={s.key}
              style={[styles.tab, activeSection === s.key && { ...styles.tabActive, borderBottomColor: accentColor }]}
              onPress={() => setActiveSection(s.key)}
            >
              <Ionicons name={s.icon as any} size={16} color={activeSection === s.key ? accentColor : Colors.textSecondary} />
              <Text style={[styles.tabText, activeSection === s.key && { color: accentColor }]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Conteúdo da seção ativa */}
      <View style={styles.sectionContent}>
        {activeSection === 'conteudo' && (
          <Text style={styles.bodyText}>{licao.conteudo}</Text>
        )}
        {activeSection === 'oracao' && licao.oracao && (
          <View style={styles.oracaoBlock}>
            <Ionicons name="heart" size={20} color={accentColor} style={{ marginBottom: Spacing.sm }} />
            <Text style={[styles.bodyText, styles.oracaoText]}>{licao.oracao}</Text>
          </View>
        )}
        {activeSection === 'atividade' && licao.atividade && (
          <View style={styles.atividadeBlock}>
            <Text style={styles.atividadeLabel}>O que fazer:</Text>
            <Text style={styles.bodyText}>{licao.atividade}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 32 },
  heroCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 5,
    marginBottom: Spacing.sm,
    ...Shadow.small,
  },
  numCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  numText: { color: '#FFF', fontWeight: '800', fontSize: 20 },
  heroInfo: { flex: 1 },
  heroFase: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600', textTransform: 'uppercase' },
  heroTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { fontSize: 13, color: Colors.textSecondary },
  objetivoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.small,
  },
  objetivoLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: 4 },
  objetivoText: { fontSize: 15, color: Colors.text, lineHeight: 22 },
  versiculoCard: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  versiculoText: { flex: 1, fontSize: 15, fontStyle: 'italic', fontWeight: '600', lineHeight: 22 },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    ...Shadow.small,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    borderRadius: Radius.md,
  },
  tabActive: { borderBottomWidth: 2 },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  sectionContent: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    ...Shadow.small,
  },
  bodyText: { fontSize: 15, color: Colors.text, lineHeight: 24 },
  oracaoBlock: { alignItems: 'center' },
  oracaoText: { textAlign: 'center', fontStyle: 'italic' },
  atividadeBlock: {},
  atividadeLabel: { fontSize: 13, fontWeight: '700', color: Colors.textSecondary, marginBottom: Spacing.sm, textTransform: 'uppercase' },
});
