import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import { useApp } from '../../context/AppContext';
import { Comunicado, RootStackParamList } from '../../types';

type Nav = StackNavigationProp<RootStackParamList>;

const TIPO_CONFIG = {
  urgente: { color: Colors.error, bgColor: '#FDEDEC', icon: 'alert-circle', label: 'Urgente' },
  aviso: { color: Colors.warning, bgColor: '#FEF5E7', icon: 'information-circle', label: 'Aviso' },
  informativo: { color: Colors.accent, bgColor: '#EAF4FB', icon: 'chatbubble-ellipses', label: 'Informativo' },
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ComunicadosScreen() {
  const navigation = useNavigation<Nav>();
  const { comunicados, marcarComunicadoLido } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unreadCount = comunicados.filter(c => !c.lido).length;

  function toggleExpand(com: Comunicado) {
    if (!com.lido) marcarComunicadoLido(com.id);
    setExpandedId(prev => (prev === com.id ? null : com.id));
  }

  function renderItem({ item }: { item: Comunicado }) {
    const cfg = TIPO_CONFIG[item.tipo];
    const isExpanded = expandedId === item.id;

    return (
      <TouchableOpacity
        style={[styles.card, !item.lido && styles.cardUnread]}
        onPress={() => toggleExpand(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.tipoIcon, { backgroundColor: cfg.bgColor }]}>
            <Ionicons name={cfg.icon as any} size={20} color={cfg.color} />
          </View>
          <View style={styles.cardMeta}>
            <View style={styles.cardMetaRow}>
              <Text style={[styles.tipoLabel, { color: cfg.color }]}>{cfg.label}</Text>
              {!item.lido && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.cardInfo}>
              {item.autor} • {formatDate(item.data)}
            </Text>
            <Text style={styles.cardDestinatarios}>
              Para: {item.destinatarios.join(', ')}
            </Text>
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={Colors.notMarked}
          />
        </View>

        {isExpanded && (
          <View style={styles.cardBody}>
            <View style={styles.divider} />
            <Text style={styles.bodyText}>{item.conteudo}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Comunicados</Text>
          <Text style={styles.headerSub}>
            {unreadCount > 0 ? `${unreadCount} não lido${unreadCount > 1 ? 's' : ''}` : 'Todos lidos'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('NovoComunicado')}
        >
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={comunicados}
        keyExtractor={item => item.id}
        renderItem={renderItem}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { color: '#FFF', fontSize: 26, fontWeight: '800' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { padding: Spacing.md, backgroundColor: Colors.background, flexGrow: 1, paddingBottom: 24 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.small,
  },
  cardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  tipoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: { flex: 1 },
  cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  tipoLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 2 },
  cardInfo: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  cardDestinatarios: { fontSize: 12, color: Colors.accent, marginTop: 2, fontWeight: '600' },
  cardBody: {},
  divider: { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.sm },
  bodyText: { fontSize: 15, color: Colors.text, lineHeight: 24 },
});
