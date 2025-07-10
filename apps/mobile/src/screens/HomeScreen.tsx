import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../App';
import { useAuth } from '../contexts/AuthContext';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Survival Pending</Text>
        <Text style={styles.subtitle}>
          Anonymous stories from the LGBTQ+ community
        </Text>
      </View>

      <View style={styles.actions}>
        {user ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('StorySubmission')}
            >
              <Text style={styles.buttonText}>Share Your Story</Text>
            </TouchableOpacity>
            <Text style={styles.welcomeText}>Welcome, {user.username}</Text>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.buttonText}>Sign In to Share</Text>
            </TouchableOpacity>
            <Text style={styles.infoText}>
              Create an anonymous account to share your story
            </Text>
          </>
        )}
      </View>

      <View style={styles.storiesSection}>
        <Text style={styles.sectionTitle}>Recent Stories</Text>
        <Text style={styles.comingSoon}>Stories coming soon...</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  actions: {
    padding: 20,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
  },
  infoText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
  },
  storiesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  comingSoon: {
    color: '#666',
    fontSize: 16,
    fontStyle: 'italic',
  },
});