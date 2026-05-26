import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { RootStackParamList } from '../../types';

type Route = RouteProp<RootStackParamList, 'CatequizandoDetalhe'>;

function calcIdade(dataNasc: string): number {
  const [y, m, d] = dataNasc.split('-').map(Number);
  const birth = new Date(y, m - 1, d);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--;
  return age;
}

function formatDate(dateStr: string) {
  const [y, mo, d] = dateStr.split('-').map(Number);
  return new Date(y, mo - 1, d).toLocaleDateString('pt-BR');
}

export default function CatequizandoDetalheScreen() {
  const { params: { catequizando } } = useRoute<Route>();
  const { chamadas } = useApp();

  const myChamadas = chamadas
    .filter(ch => ch.turma === catequizando.turma)
    .map(ch => ({
      data: ch.data,
      presente: ch.presencas.find(p => p.catequizandoId === catequizando.id)?.presente ?? false,
    }))
    .sort((a, b) => b.data.localeCompare(a.data));

  const totalAulas = myChamadas.length;
  const presentes = myChamadas.filter(c => c.presente).length;
  const freq = totalAulas > 0 ? Math.round((presentes / totalAulas) * 100) : 0;
  const freqColor = freq >= 75 ? Colors.success : freq >= 50 ? Colors.warning : Colors.error;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Perfil */}
      <View style={styles.profileCard}>
        <Avatar name={catequizando.nome} size={72} />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{catequizando.nome}</Text>
          <Badge label={catequizando.turma} variant={catequizando.turma === 'Crisma' ? 'warning' : 'primary'} />
          <Text style={styles.profileAge}>{calcIdade(catequizando.dataNascimento)} anos • Nascido em {formatDate(catequizando.dataNascimento)}</Text>
        </View>
      </View>

      {/* Frequência */}
      <View style={styles.freqCard}>
        <Text style={styles.sectionLabel}>Frequência</Text>
        <View style={styles.freqRow}>
          <View style={styles.freqStat}>
            <Text style={[styles.freqNumber, { color: freqColor }]}>{freq}%</Text>
            <Text style={styles.freqLabel}>Frequência</Text>
          </View>
          <View style={styles.freqStat}>
            <Text style={styles.freqNumber}>{presentes}</Text>
            <Text style={styles.freqLabel}>Presenças</Text>
          </View>
          <View style={styles.freqStat}>
            <Text style={styles.freqNumber}>{totalAulas - presentes}</Text>
            <Text style={styles.freqLabel}>Faltas</Text>
          </View>
          <View style={styles.freqStat}>
            <Text style={styles.freqNumber}>{totalAulas}</Text>
            <Text style={styles.freqLabel}>Total Aulas</Text>
          </View>
        </View>

        {/* Barra de progresso */}
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${freq}%` as any, backgroundColor: freqColor }]} />
        </View>
      </View>

      {/* Responsável */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionLabel}>Responsável</Text>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoText}>{catequizando.responsavel}</Text>
        </View>
        <TouchableOpacity
          style={styles.infoRow}
          onPress={() => Linking.openURL(`tel:${catequizando.telefone}`)}
        >
          <Ionicons name="call" size={16} color={Colors.accent} />
          <Text style={[styles.infoText, { color: Colors.accent }]}>{catequizando.telefone}</Text>
        </TouchableOpacity>
        {catequizando.email && (
          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => Linking.openURL(`mailto:${catequizando.email}`)}
          >
            <Ionicons name="mail" size={16} color={Colors.accent} />
            <Text style={[styles.infoText, { color: Colors.accent }]}>{catequizando.email}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Histórico de chamadas */}
      {myChamadas.length > 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.sectionLabel}>Histórico de Chamadas</Text>
          {myChamadas.slice(0, 10).map((ch, idx) => (
            <View key={idx} style={styles.chamadaRow}>
              <Ionicons
                name={ch.presente ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={ch.presente ? Colors.present : Colors.absent}
              />
              <Text style={styles.chamadaDate}>{formatDate(ch.data)}</Text>
              <Text style={[styles.chamadaStatus, { color: ch.presente ? Colors.present : Colors.absent }]}>
                {ch.presente ? 'Presente' : 'Falta'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 32 },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.small,
  },
  profileInfo: { flex: 1, gap: 6 },
  profileName: { fontSize: 20, fontWeight: '800', color: Colors.text },
  profileAge: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  freqCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.small,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: Spacing.sm },
  freqRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: Spacing.md },
  freqStat: { alignItems: 'center' },
  freqNumber: { fontSize: 24, fontWeight: '800', color: Colors.text },
  freqLabel: { fontSize: 12, color: Colors.textSecondary },
  progressBg: { height: 8, backgroundColor: Colors.border, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: 8, borderRadius: Radius.full },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.small,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  infoText: { fontSize: 15, color: Colors.text },
  chamadaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  chamadaDate: { flex: 1, fontSize: 14, color: Colors.text },
  chamadaStatus: { fontSize: 13, fontWeight: '600' },
});
