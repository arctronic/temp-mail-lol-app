import React from 'react';
import { FlatList, LayoutAnimation, Pressable, StyleSheet, View } from 'react-native';
import { Chip } from 'react-native-paper';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { LookupEmailWithMessages } from '../../contexts/LookupContext';
import { useThemeColor } from '../../hooks/useThemeColor';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol } from './IconSymbol';

interface InboxChipListProps {
  lookupEmails: LookupEmailWithMessages[];
  selectedInbox: string | null;
  onInboxSelect: (address: string) => void;
  onInboxRemove: (address: string) => void;
  onAddInbox: () => void;
  maxInboxes?: number;
}

export function InboxChipList({
  lookupEmails,
  selectedInbox,
  onInboxSelect,
  onInboxRemove,
  onAddInbox,
  maxInboxes = 5,
}: InboxChipListProps) {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'border');
  const backgroundColor = useThemeColor({}, 'background');

  const truncateEmail = (email: string, maxLength: number = 15) => {
    if (email.length <= maxLength) return email;
    const [local, domain] = email.split('@');
    const truncatedLocal = local.length > 8 ? local.substring(0, 8) + '...' : local;
    return `${truncatedLocal}@${domain}`;
  };

  const getUnreadCount = (email: LookupEmailWithMessages) => {
    return email.unreadCount || 0;
  };

  const handleChipPress = (address: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onInboxSelect(address);
  };

  const handleRemoveChip = (address: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onInboxRemove(address);
  };

  const handleAddPress = () => {
    if (lookupEmails.length >= maxInboxes) {
      // This will be handled by parent component with snackbar
      return;
    }
    onAddInbox();
  };

  const renderInboxChip = ({ item, index }: { item: LookupEmailWithMessages; index: number }) => {
    const isSelected = selectedInbox === item.address;
    const unreadCount = getUnreadCount(item);
    const chipLabel = truncateEmail(item.address);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        exiting={FadeOutDown.springify()}
        style={styles.chipContainer}
      >
        <Chip
          mode={isSelected ? 'flat' : 'outlined'}
          selected={isSelected}
          onPress={() => handleChipPress(item.address)}
          onClose={() => handleRemoveChip(item.address)}
          closeIcon="close"
          style={[
            styles.inboxChip,
            {
              backgroundColor: isSelected ? tintColor : backgroundColor,
              borderColor: isSelected ? tintColor : borderColor,
            },
          ]}
          textStyle={{
            color: isSelected ? '#ffffff' : textColor,
            fontSize: 12,
            fontWeight: isSelected ? '600' : '400',
          }}
          showSelectedOverlay={false}
        >
          {chipLabel}
          {unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: isSelected ? '#ffffff' : tintColor }]}>
              <ThemedText style={[
                styles.unreadText,
                { color: isSelected ? tintColor : '#ffffff' }
              ]}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </ThemedText>
            </View>
          )}
        </Chip>
      </Animated.View>
    );
  };

  const renderAddButton = () => {
    const isAtLimit = lookupEmails.length >= maxInboxes;
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.addButton,
          {
            backgroundColor: isAtLimit ? `${borderColor}50` : `${tintColor}20`,
            borderColor: isAtLimit ? borderColor : tintColor,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        onPress={handleAddPress}
        disabled={isAtLimit}
      >
        <IconSymbol 
          name="plus" 
          size={16} 
          color={isAtLimit ? borderColor : tintColor} 
        />
        <ThemedText style={[
          styles.addButtonText,
          { color: isAtLimit ? borderColor : tintColor }
        ]}>
          Add
        </ThemedText>
      </Pressable>
    );
  };

  const renderFooter = () => (
    <View style={styles.listFooter}>
      {renderAddButton()}
    </View>
  );

  const renderEmpty = () => (
    <ThemedView style={styles.emptyContainer}>
      <IconSymbol name="tray" size={32} color={borderColor} />
      <ThemedText style={[styles.emptyText, { color: borderColor }]}>
        No inboxes added yet
      </ThemedText>
      {renderAddButton()}
    </ThemedView>
  );

  if (lookupEmails.length === 0) {
    return renderEmpty();
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={lookupEmails}
        renderItem={renderInboxChip}
        keyExtractor={(item) => item.address}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipList}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View style={styles.chipSeparator} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  chipList: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  chipContainer: {
    position: 'relative',
  },
  inboxChip: {
    marginVertical: 4,
    borderWidth: 1,
  },
  chipSeparator: {
    width: 8,
  },
  listFooter: {
    marginLeft: 8,
    justifyContent: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: 'bold',
    lineHeight: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
}); 