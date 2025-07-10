import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

const MAX_CHARACTERS = 1000;

export function StorySubmissionScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [story, setStory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!story.trim()) {
      Alert.alert('Error', 'Please write your story before submitting');
      return;
    }

    if (story.length > MAX_CHARACTERS) {
      Alert.alert('Error', `Story must be under ${MAX_CHARACTERS} characters`);
      return;
    }

    setIsSubmitting(true);
    try {
      // This would call your API endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/story/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ content: story }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit story');
      }

      Alert.alert(
        'Success',
        'Your story has been submitted and will be reviewed soon.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.instructions}>
            Share your story anonymously. It will be converted to audio using AI voices.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Write your story here..."
              placeholderTextColor="#666"
              value={story}
              onChangeText={setStory}
              multiline
              textAlignVertical="top"
              maxLength={MAX_CHARACTERS}
            />
            <Text style={styles.characterCount}>
              {story.length}/{MAX_CHARACTERS}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Submitting...' : 'Submit Story'}
            </Text>
          </TouchableOpacity>

          <View style={styles.safetyInfo}>
            <Text style={styles.safetyTitle}>Your Safety Matters</Text>
            <Text style={styles.safetyText}>
              • Your story is completely anonymous{'\n'}
              • No personal information is collected{'\n'}
              • AI voices ensure your identity is protected{'\n'}
              • You can exit quickly by pressing back
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  instructions: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    lineHeight: 24,
  },
  inputContainer: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    minHeight: 200,
  },
  textInput: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 150,
  },
  characterCount: {
    color: '#666',
    fontSize: 14,
    textAlign: 'right',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  safetyInfo: {
    backgroundColor: '#111',
    padding: 20,
    borderRadius: 8,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  safetyText: {
    fontSize: 14,
    color: '#999',
    lineHeight: 22,
  },
});