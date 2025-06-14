import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const currentLanguage = i18n.language;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('select_language')}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.button,
            currentLanguage === 'nl' ? styles.activeButton : null,
          ]}
          onPress={() => changeLanguage('nl')}
        >
          <Text
            style={[
              styles.buttonText,
              currentLanguage === 'nl' ? styles.activeButtonText : null,
            ]}
          >
            {t('dutch')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            currentLanguage === 'en' ? styles.activeButton : null,
          ]}
          onPress={() => changeLanguage('en')}
        >
          <Text
            style={[
              styles.buttonText,
              currentLanguage === 'en' ? styles.activeButtonText : null,
            ]}
          >
            {t('english')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 16 },
  title: { fontSize: 18, marginBottom: 12 },
  buttonRow: { flexDirection: 'row', justifyContent: 'center' },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
    borderRadius: 6,
  },
  activeButton: {
    backgroundColor: '#2A4BA0',
  },
  buttonText: {
    fontSize: 16,
    color: '#222',
  },
  activeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
