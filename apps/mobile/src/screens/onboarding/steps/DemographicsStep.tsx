import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from '../../../components/ui';
import { spacing } from '../../../utils/theme';
import { useTheme } from '../../../contexts/ThemeContext';
import { userApi } from '../../../api/user';

interface DemographicsStepProps {
  demographics: any;
  setDemographics: (value: any) => void;
}

const AGE_RANGES = ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65+', 'Prefer not to say'];
const GENDERS = ['Woman', 'Man', 'Non-binary', 'Two-Spirit', 'Agender', 'Other', 'Prefer not to say'];
const RACES = [
  'Asian',
  'Black or African American',
  'Hispanic or Latino',
  'Native American or Alaska Native',
  'Native Hawaiian or Pacific Islander',
  'White',
  'Multiple races',
  'Other',
  'Prefer not to say',
];
const URBANICITY = ['Urban', 'Suburban', 'Rural', 'Prefer not to say'];

export function DemographicsStep({ demographics, setDemographics }: DemographicsStepProps) {
  const { colors } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (category: string, value: string) => {
    setDemographics((prev: any) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await userApi.saveDemographics(demographics);
    } catch (error) {
      console.error('Failed to save demographics:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOptions = (category: string, options: string[], key: string) => (
    <View style={styles.section}>
      <Text variant="h6" style={styles.sectionTitle}>
        {category}
      </Text>
      <View style={styles.options}>
        {options.map((option) => (
          <Button
            key={option}
            variant={demographics[key] === option ? 'default' : 'outline'}
            size="sm"
            onPress={() => handleSelect(key, option)}
            style={styles.optionButton}
          >
            {option}
          </Button>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <Text variant="h2" align="center" style={styles.title}>
          Help Us Understand
        </Text>

        <Text variant="body" color="muted" align="center" style={styles.description}>
          This information helps us better serve the LGBTQ+ community. 
          All fields are optional and completely anonymous.
        </Text>

        {renderOptions('Age Range', AGE_RANGES, 'ageRange')}
        {renderOptions('Gender Identity', GENDERS, 'genderIdentity')}
        {renderOptions('Racial Identity', RACES, 'racialIdentity')}
        {renderOptions('Location Type', URBANICITY, 'urbanicity')}

        <View style={[styles.privacyNote, { backgroundColor: colors.muted }]}>
          <Text variant="caption" weight="semibold">
            🔒 Your Privacy
          </Text>
          <Text variant="caption" color="muted" style={styles.privacyText}>
            This data is never linked to your account and is only used in aggregate 
            to understand our community's needs.
          </Text>
        </View>

        {Object.keys(demographics).length > 0 && (
          <Button
            variant="secondary"
            onPress={handleSubmit}
            loading={isSubmitting}
            fullWidth
            style={styles.submitButton}
          >
            Save Demographics
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing[4],
  },
  title: {
    marginBottom: spacing[4],
  },
  description: {
    marginBottom: spacing[8],
    maxWidth: 300,
    alignSelf: 'center',
    lineHeight: 24,
  },
  section: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    marginBottom: spacing[3],
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  optionButton: {
    marginBottom: spacing[2],
  },
  privacyNote: {
    padding: spacing[4],
    borderRadius: 8,
    marginTop: spacing[4],
    marginBottom: spacing[6],
  },
  privacyText: {
    marginTop: spacing[1],
    lineHeight: 20,
  },
  submitButton: {
    marginTop: spacing[4],
  },
});