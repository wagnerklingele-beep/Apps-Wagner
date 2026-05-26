import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import Avatar from '../../components/Avatar';
import { Chamada, RootStackParamList } from '../../types';

type Route = RouteProp<RootStackParamList, 'Chamada'>;

function formatDateBr(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

export default function ChamadaScreen() {
  const { params: { turma, data } } = useRoute<Route>();
  const navigation = useNavigation();
  const { catequizandos, chamadas, saveChamada } = useApp();

  const alunosDaTurma = catequizandos.filter(c => c.ativo && c.turma === turma);

  const existingChamada = chamadas.find(ch => ch.turma === turma && ch.data === data);

  const [presencas, setPresencas] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    alunosDaTurma.forEach(a => {
      initial[a.id] = existingChamada
        ? (existingChamada.presencas.find(p => p.catequizandoId === a.id)?.presente ?? false)
        : false;
    });
    return initial;
  });

  const presentesCount = Object.values(presencas).filter(Boolean).length;
  const totalCount = alunosDaTurma.length;

  function togglePresenca(id: string) {
    setPresencas(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function marcarTodos(presente: boolean) {
    const newPresencas: Record<string, boolean> = {};
    alunosDaTurma.forEach(a => { newPresencas[a.id] = presente; });
    setPresencas(newPresencas);
  }

  function handleSalvar() {
    const chamada: Chamada = {
      id: existingChamada?.id ?? `ch_${Date.now()}`,
      data,
      turma,
      presencas: alunosDaTurma.map(a => ({ catequizandoId: a.id, presente: presencas[a.id] ?? false })),
    };
    saveChamada(chamada);
    Alert.alert('Chamada salva!', `${presentesCount} de ${totalCount} presentes.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <View style={styles.container}>
      {/* Header info */}
      <View style={styles.infoBar}>
        <View>
          <Text style={styles.turmaText}>{turma}</Text>
          <Text style={styles.dataText}>{formatDateBr(data)}</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{presentesCount}/{totalCount}</Text>
          <Text style={styles.countLabel}>presentes</Text>
        </View>
      </View>

      {/* Ações rápidas */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => marcarTodos(true)}>
          <Ionicons name="checkmark-done" size={16} color={Colors.success} />
          <Text style={[styles.quickBtnText, { color: Colors.success }]}>Todos presentes</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => marcarTodos(false)}>
          <Ionicons name="close" size={16} color={Colors.error} />
          <Text style={[styles.quickBtnText, { color: Colors.error }]}>Limpar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <FlatList
        data={alunosDaTurma}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const presente = presencas[item.id] ?? false;
          return (
            <TouchableOpacity
              style={[styles.alunoCard, presente && styles.alunoCardPresente]}
              onPress={() => togglePresenca(item.id)}
              activeOpacity={0.7}
            >
              <Avatar name={item.nome} size={44} />
              <View style={styles.alunoInfo}>
                <Text style={styles.alunoNome}>{item.nome}</Text>
                <Text style={styles.alunoResp}>{item.responsavel}</Text>
              </View>
              <View style={[styles.statusIcon, { backgroundColor: presente ? Colors.present : Colors.border }]}>
                <Ionicons
                  name={presente ? 'checkmark' : 'close'}
                  size={20}
                  color={presente ? '#FFF' : Colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          );
        }}
        showsVerticalScrollIndicator={false}
      />

      {/* Botão salvar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSalvar}>
          <Ionicons name="save" size={20} color="#FFF" />
          <Text style={styles.saveBtnText}>Salvar Chamada</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  infoBar: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  turmaText: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  dataText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2, textTransform: 'capitalize' },
  countBadge: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  countText: { color: '#FFF', fontSize: 22, fontWeight: '800' },
  countLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  quickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
  },
  quickBtnText: { fontSize: 13, fontWeight: '600' },
  list: { padding: Spacing.md, paddingBottom: 100 },
  alunoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadow.small,
  },
  alunoCardPresente: { borderColor: Colors.present, backgroundColor: '#F0FAF4' },
  alunoInfo: { flex: 1 },
  alunoNome: { fontSize: 15, fontWeight: '700', color: Colors.text },
  alunoResp: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.small,
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});
