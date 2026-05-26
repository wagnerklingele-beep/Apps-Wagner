import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Comunicado } from '../../types';

type TipoComunicado = 'aviso' | 'urgente' | 'informativo';

const TIPOS: { key: TipoComunicado; label: string; color: string; icon: string }[] = [
  { key: 'informativo', label: 'Informativo', color: Colors.accent, icon: 'chatbubble-ellipses' },
  { key: 'aviso', label: 'Aviso', color: Colors.warning, icon: 'information-circle' },
  { key: 'urgente', label: 'Urgente', color: Colors.error, icon: 'alert-circle' },
];

const DESTINATARIOS_OPT = ['Todos', '1ª Eucaristia', 'Crisma'];

export default function NovoComunicadoScreen() {
  const navigation = useNavigation();
  const { addComunicado } = useApp();

  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tipo, setTipo] = useState<TipoComunicado>('informativo');
  const [destinatarios, setDestinatarios] = useState<string[]>(['Todos']);

  function toggleDestinatario(dest: string) {
    if (dest === 'Todos') {
      setDestinatarios(['Todos']);
      return;
    }
    setDestinatarios(prev => {
      const withoutTodos = prev.filter(d => d !== 'Todos');
      if (withoutTodos.includes(dest)) {
        const updated = withoutTodos.filter(d => d !== dest);
        return updated.length === 0 ? ['Todos'] : updated;
      }
      return [...withoutTodos, dest];
    });
  }

  function handlePublicar() {
    if (!titulo.trim() || !conteudo.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha o título e o conteúdo do comunicado.');
      return;
    }

    const novo: Comunicado = {
      id: `com_${Date.now()}`,
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      data: new Date().toISOString().split('T')[0],
      autor: 'Catequista',
      destinatarios,
      lido: false,
      tipo,
    };

    addComunicado(novo);
    Alert.alert('Comunicado publicado!', 'O comunicado foi enviado com sucesso.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {/* Tipo */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tipo</Text>
        <View style={styles.tipoRow}>
          {TIPOS.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.tipoBtn, tipo === t.key && { borderColor: t.color, backgroundColor: `${t.color}15` }]}
              onPress={() => setTipo(t.key)}
            >
              <Ionicons name={t.icon as any} size={20} color={tipo === t.key ? t.color : Colors.notMarked} />
              <Text style={[styles.tipoBtnText, tipo === t.key && { color: t.color }]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Destinatários */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Destinatários</Text>
        <View style={styles.destRow}>
          {DESTINATARIOS_OPT.map(d => {
            const selected = destinatarios.includes(d);
            return (
              <TouchableOpacity
                key={d}
                style={[styles.destBtn, selected && styles.destBtnActive]}
                onPress={() => toggleDestinatario(d)}
              >
                {selected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                <Text style={[styles.destBtnText, selected && styles.destBtnTextActive]}>{d}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Conteúdo */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Mensagem</Text>

        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Encontro de pais — 10 de junho"
          value={titulo}
          onChangeText={setTitulo}
          autoCapitalize="sentences"
        />

        <Text style={styles.label}>Conteúdo *</Text>
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Escreva o conteúdo do comunicado aqui..."
          value={conteudo}
          onChangeText={setConteudo}
          multiline
          numberOfLines={8}
          textAlignVertical="top"
          autoCapitalize="sentences"
        />
      </View>

      {/* Preview */}
      {(titulo || conteudo) && (
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Pré-visualização</Text>
          <View style={styles.previewHeader}>
            <Ionicons name={TIPOS.find(t => t.key === tipo)!.icon as any} size={16} color={TIPOS.find(t => t.key === tipo)!.color} />
            <Text style={[styles.previewTipo, { color: TIPOS.find(t => t.key === tipo)!.color }]}>
              {TIPOS.find(t => t.key === tipo)!.label}
            </Text>
            <Text style={styles.previewDest}>Para: {destinatarios.join(', ')}</Text>
          </View>
          {titulo ? <Text style={styles.previewTitle}>{titulo}</Text> : null}
          {conteudo ? <Text style={styles.previewBody} numberOfLines={3}>{conteudo}</Text> : null}
        </View>
      )}

      <TouchableOpacity style={styles.publishBtn} onPress={handlePublicar}>
        <Ionicons name="megaphone" size={20} color="#FFF" />
        <Text style={styles.publishBtnText}>Publicar Comunicado</Text>
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
  tipoRow: { flexDirection: 'row', gap: Spacing.sm },
  tipoBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 4,
  },
  tipoBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  destRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  destBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  destBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  destBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  destBtnTextActive: { color: '#FFF' },
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
  inputMultiline: { minHeight: 140, paddingTop: Spacing.sm },
  previewCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
    ...Shadow.small,
  },
  previewLabel: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', marginBottom: 6 },
  previewHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  previewTipo: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  previewDest: { fontSize: 12, color: Colors.textSecondary, marginLeft: 4 },
  previewTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  previewBody: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, lineHeight: 20 },
  publishBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadow.medium,
  },
  publishBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
