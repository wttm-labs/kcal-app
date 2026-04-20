//Import React state hook
//useState lets us store and update values inside the component 

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from "react";


// Import React Native UI components and helpers
import {
  Button, // Container (like a div)
  KeyboardAvoidingView, // Display text
  Platform,
  Pressable, // Button
  ScrollView, // Input field
  StyleSheet,
  Text, // Styling system
  TextInput, // Prevent keyboard from converting inputs
  View,
} from 'react-native';

type Entry = {
    id: string;
    date: string;
    garminBurn: number;
    appleBurn: number;
    intake: number;
    trainingType: 'strength' | 'running' | 'hiit';
    realBurn: number;
    deficit: number;
    notes: string;
};

const STORAGE_KEY = 'entries';

// Main screen component
export default function HomeScreen() {

  // ------------------------------------------
  // INPUT STATE
  // ------------------------------------------
  // These store what the user types into the inputs 
  // Important: TextInput always returns strings 
  const [garmin, setGarmin] = useState('');
  const [apple, setApple] = useState('');
  const [intake, setIntake] = useState('');
  const [trainingType, setTrainingType] = useState<'strength' | 'running' | 'hiit'>('running');
  
  // ------------------------------------------
  // RESULT STATE
  // ------------------------------------------
  // Stores calculated results 
  // null = no result yet 
  const [realBurn, setRealBurn] = useState<number | null>(null);
  const [deficit, setDeficit] = useState<number | null>(null);
  
  const [entries, setEntries] = useState<Entry[]>([]);



  useEffect(() => {
    const loadEntries = async () => {
      try{
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setEntries(JSON.parse(stored));
        }
      } catch (error) {
        console.log('Error loading entries', error);
      }
    };

    loadEntries();
  }, []);


  //--------------------------------------------
  // SAVED ENTRIES STATE
  //--------------------------------------------
  // Stores all saved daily logs (history of entries)

  
  // ------------------------------------------
  // RESULT STATE
  // ------------------------------------------
  // This runs when the button is pressed 
  const handleCalculate = () => {
    
    //Convert input strings to numbers
    const g = Number (garmin);
    const a = Number (apple);
    const i = Number (intake);

    //Validate inputs (check for invalid numbers)
    if (isNaN(g) || isNaN(a) || isNaN(i)){
      alert ('Please enter valid numbers');
      return; // stop execution if invalid 
    }
  
    
    //Calculate avarage burn
    const avg = (g + a)/2;

    let factor = 1

    if (trainingType === 'strength') factor = 0.95;
    if (trainingType === 'running') factor = 1.00;
    if (trainingType === 'hiit') factor = 1.05;

    const real = avg * factor;

    //Calculate deficit
    const def = real - i;

    //Update state -> triggers UI re-render
    setRealBurn(real);
    setDeficit(def);
  };

  const handleSaveEntry = async () => {
    if (realBurn === null || deficit === null) return;

    const entry: Entry = {
      id: Date.now().toString(),
      date: new Date().toISOString() , // later should be more dynamicly ---> done
      garminBurn: Number(garmin),
      appleBurn: Number(apple),
      intake: Number(intake),
      trainingType,
      realBurn,
      deficit,
      notes: '',
    };

    const updatedEntries = [entry, ...entries];

    setEntries (updatedEntries);

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    } catch (error) {
      console.log('Error saving entries:', error);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);

    try{
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    } catch (error) {
      console.log('Error deleting entry:', error);
    }
  };  
  
  // ------------------------------------------
  // UI RENDER
  // ------------------------------------------
  return (
    <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle = {styles.scrollContent}
        keyboardShouldPersistTaps = "handled"
      >

    
        <Text style={styles.title}>Kcal Rechner</Text>
        <TextInput 
          style = {styles.input}
          placeholder="Garmin Burn"
          placeholderTextColor="#8e8e93"
          keyboardType="numeric"
          value={garmin}
          onChangeText={setGarmin}
        />

        <TextInput 
        style = {styles.input}
        placeholder="Apple Burn"
        placeholderTextColor="#8e8e93"
        keyboardType="numeric"
        value={apple}
        onChangeText={setApple}
        />

        <TextInput
        style={styles.input}
        placeholder="Intake"
        placeholderTextColor="#8e8e93"
        keyboardType="numeric"
        value={intake}
        onChangeText={setIntake}
        />
        <Text style={styles.sectionTitle}>Training Type</Text>
          <View style={styles.buttonRow}>
            {(['strength', 'running', 'hiit']as const).map((type) => (
            <Pressable 
             key={type}
              onPress={() => setTrainingType(type)}
              style={({ pressed }) => [
              styles.typeButton,
              trainingType === type && styles.typeButtonActive,
              pressed && styles.typeButtonPressed, 
            ]}
          >
            <Text
              style={[
                styles.typeButtonText,
                trainingType === type && styles.typeButtonTextActive,
              ]}
          >
              {type.toUpperCase()}
            </Text>
          </Pressable>
          ))}
        </View>


        <Button title="Calculate" onPress={handleCalculate} />

        {realBurn !== null && (
          <View style={styles.result}>
            <Text style={styles.resultText}>
              Real Burn: {realBurn.toFixed(0)} kcal 
            </Text>
            <Text style={styles.resultText}>
             Deficit: {deficit?.toFixed(0)} kcal
            </Text>

        
        <Button 
        title="Save Entry" 
        onPress={handleSaveEntry} 
        disabled={realBurn === null}
        />
        </View>
        )}



        {entries.length > 0 && (
         <View style = {{ marginTop: 20 }}>
            {entries.map ((entry, index) => (
              <View 
               key={entry.id}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 10,
                  marginBottom: 10,
                  backgroundColor: 'ffffff',
                }}
              > 
                <Text style = {{ color: '#666', marginBottom: 6}}>
                  {new Date(entry.date).toLocaleString('de-DE')}
                </Text>

                <Text style = {{ fontWeight: '600', color: '#111'}}>
                  {entry.trainingType.toUpperCase()}
                </Text>
          
                <Text>Real Burn: {entry.realBurn.toFixed(0)} kcal </Text>
                <Text> Deficit: {entry.deficit.toFixed(0)} kcal</Text>
              
                <Button title="Delete" onPress={() => handleDeleteEntry(entry.id)}/>
        
              </View>
            ))}
          </View>
    )}</ScrollView>
    </KeyboardAvoidingView>
  );
}

// ------------------------------------------
  // STYLES
  // ------------------------------------------
const styles = StyleSheet.create({

  // Main container fills screen
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },

  // Title styling
  title:{
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111111',
  },

  // Input field styling
  input:{
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    color: '#111111'
  },

  // Result container
  result: {
    marginTop: 20,
    alignItems: 'center',
  },

  // Result text styling
  resultText: {
    fontSize: 18,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 10,
    textAlign: 'center'
  },

  buttonRow: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
    width: '100%',
  },

  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',// light grey -> transparent
  },

  typeButtonActive: {
    backgroundColor: '#ffffff',  
    borderColor: '#007AFF',
    borderWidth: 1.5,
  },
  typeButtonPressed: {
    backgroundColor: 'f7f7f7',
  },

  typeButtonText: {
    color: '#1c1c1e',
    fontSize: 14,
    fontWeight: '600',
  },

  typeButtonTextActive: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },

  scrollContent: {
    paddingBottom: 40,
  },

});
