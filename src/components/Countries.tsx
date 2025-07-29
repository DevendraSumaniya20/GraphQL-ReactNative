import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ListRenderItem,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { gql, useQuery } from '@apollo/client';

interface Country {
  code: string;
  name: string;
  emoji: string;
  continent?: {
    name: string;
  };
  capital?: string;
  currency?: string;
}

interface CountriesData {
  countries: Country[];
}

const GET_COUNTRIES = gql`
  query {
    countries {
      code
      name
      emoji
      continent {
        name
      }
      capital
      currency
    }
  }
`;

export default function Countries(): React.FC {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(
    null,
  );

  const { loading, error, data, refetch } =
    useQuery<CountriesData>(GET_COUNTRIES);

  // Filter countries based on search query and continent
  const filteredCountries = useMemo(() => {
    if (!data?.countries) return [];

    return data.countries.filter(country => {
      const matchesSearch =
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesContinent =
        !selectedContinent || country.continent?.name === selectedContinent;

      return matchesSearch && matchesContinent;
    });
  }, [data?.countries, searchQuery, selectedContinent]);

  // Get unique continents for filter
  const continents = useMemo(() => {
    if (!data?.countries) return [];
    const uniqueContinents = [
      ...new Set(
        data.countries.map(country => country.continent?.name).filter(Boolean),
      ),
    ];
    return uniqueContinents.sort();
  }, [data?.countries]);

  const renderCountryItem: ListRenderItem<Country> = ({ item, index }) => (
    <TouchableOpacity
      style={styles.countryItem}
      activeOpacity={0.95}
      onPress={() => {
        console.log('Selected country:', item.name);
      }}
    >
      <View style={styles.countryHeader}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <View style={styles.countryInfo}>
          <Text style={styles.countryName}>{item.name}</Text>
          <Text style={styles.countryCode}>{item.code}</Text>
        </View>
      </View>

      {(item.continent || item.capital || item.currency) && (
        <View style={styles.countryDetails}>
          {item.continent && (
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>🌍</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Continent</Text>
                <Text style={styles.detailValue}>{item.continent.name}</Text>
              </View>
            </View>
          )}
          {item.capital && (
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>🏛️</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Capital</Text>
                <Text style={styles.detailValue}>{item.capital}</Text>
              </View>
            </View>
          )}
          {item.currency && (
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Text style={styles.detailIconText}>💰</Text>
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Currency</Text>
                <Text style={styles.detailValue}>{item.currency}</Text>
              </View>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderContinentFilter = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.filterTitle}>Filter by Continent</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[
          { name: 'All', value: null },
          ...continents.map(c => ({ name: c, value: c })),
        ]}
        keyExtractor={item => item.value || 'all'}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedContinent === item.value && styles.filterChipSelected,
            ]}
            onPress={() => setSelectedContinent(item.value)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedContinent === item.value &&
                  styles.filterChipTextSelected,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <View style={styles.headerIcon}>
          <Text style={styles.headerIconText}>🌍</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Countries Explorer</Text>
          <Text style={styles.subtitle}>
            Discover {filteredCountries.length}{' '}
            {filteredCountries.length === 1 ? 'country' : 'countries'} around
            the world
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyStateIcon}>
        <Text style={styles.emptyStateEmoji}>🔍</Text>
      </View>
      <Text style={styles.emptyStateTitle}>No countries found</Text>
      <Text style={styles.emptyStateSubtitle}>
        Try adjusting your search or filter criteria
      </Text>
      <TouchableOpacity
        style={styles.clearFiltersButton}
        onPress={() => {
          setSearchQuery('');
          setSelectedContinent(null);
        }}
      >
        <Text style={styles.clearFiltersText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIcon}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
          <Text style={styles.loadingText}>Loading countries...</Text>
          <Text style={styles.loadingSubtext}>
            Please wait while we fetch the data
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorEmoji}>⚠️</Text>
          </View>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error.message}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => refetch()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />

      {renderHeader()}

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries by name or code..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {renderContinentFilter()}

      <FlatList
        data={filteredCountries}
        keyExtractor={item => item.code}
        renderItem={renderCountryItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        removeClippedSubviews={true}
        maxToRenderPerBatch={20}
        windowSize={10}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  headerIconText: {
    fontSize: 28,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
    lineHeight: 22,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 12,
    color: '#64748b',
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  clearSearchButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#94a3b8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearSearchText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
    marginHorizontal: 24,
  },
  filterList: {
    paddingHorizontal: 20,
  },
  filterChip: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  filterChipSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
    ...Platform.select({
      ios: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  filterChipText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  filterChipTextSelected: {
    color: '#ffffff',
  },
  listContainer: {
    paddingVertical: 16,
  },
  separator: {
    height: 8,
  },
  countryItem: {
    marginHorizontal: 24,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  emoji: {
    fontSize: 28,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  countryCode: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  countryDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailIconText: {
    fontSize: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 40,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  loadingText: {
    fontSize: 20,
    color: '#0f172a',
    fontWeight: '700',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: '#f8fafc',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  errorEmoji: {
    fontSize: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 80,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  emptyStateEmoji: {
    fontSize: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: '500',
  },
  clearFiltersButton: {
    backgroundColor: '#64748b',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  clearFiltersText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
