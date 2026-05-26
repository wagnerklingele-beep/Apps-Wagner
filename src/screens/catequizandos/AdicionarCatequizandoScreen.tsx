import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Catequizando } from '../../types';

const TURMAS = ['1ª Eucaristia', 'Crisma'];

export default function AdicionarCatequizandoScreen() {
  const navigation = useNavigation();
  const { addCatequizando } = useApp();

  const [nome, setNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [turma, setTurma] = useState(TURMAS[0]);
  const [responsavel, setResponsavel] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  function handleSalvar() {
    if (!nome.trim() || !dataNascimento.trim() || !responsavel.trim() || !telefone.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, data de nascimento, responsável e telefone.');
      return;
    }

    const novo: Catequizando = {
      id: `c_${Date.now()}`,
      nome: nome.trim(),
      dataNascimento,
      turma,
      responsavel: responsavel.trim(),
      telefone: telefone.trim(),
      email: email.trim() || undefined,
      ativo: true,
    };

    addCatequizando(novo);
    Alert.alert('Sucesso!', `${nome} foi adicionado(a) com sucesso.`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  function formatDateInput(text: string) {
    const nums = text.replace(/\D/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 4) return `${nums.slice(0, 2)}/${nums.slice(2)}`;
    return `${nums.slice(0, 2)}/${nums.slice(2, 4)}/${nums.slice(4, 8)}`;
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Dados do Catequizando</Text>

        <Text style={styles.label}>Nome completo *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Ana Beatriz Souza"
          value={nome}
          onChangeText={setNome}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Data de nascimento *</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          value={dataNascimento}
          onChangeText={text => setDataNascimento(formatDateInput(text))}
          keyboardType="numeric"
          maxLength={10}
        />

        <Text style={styles.label}>Turma *</Text>
        <View style={styles.turmaRow}>
          {TURMAS.map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.turmaBtn, turma === t && styles.turmaBtnActive]}
              onPress={() => setTurma(t)}
            >
              <Text style={[styles.turmaBtnText, turma === t && styles.turmaBtnTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Responsável</Text>

        <Text style={styles.label}>Nome do responsável *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Maria Souza"
          value={responsavel}
          onChangeText={setResponsavel}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Telefone *</Text>
        <TextInput
          style={styles.input}
          placeholder="(11) 99999-9999"
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>E-mail (opcional)</Text>
        <TextInput
          style={styles.input}
          placeholder="email@exemplo.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSalvar}>
        <Text style={styles.saveBtnText}>Salvar Catequizando</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 32 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.small,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6, marginTop: Spacing.sm },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    padding: Spacing.sm + 2,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  turmaRow: { flexDirection: 'row', gap: Spacing.sm },
  turmaBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  turmaBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  turmaBtnText: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary },
  turmaBtnTextActive: { color: '#FFF' },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.medium,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
