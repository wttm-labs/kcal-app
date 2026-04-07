//Import React state hook
//useState lets us store and update values inside the component 
import { useState } from "react";

// Import React Native UI components and helpers
import {
  Button, // Container (like a div)
  KeyboardAvoidingView, // Display text
  Platform, // Input field
  StyleSheet, // Button
  Text, // Styling system
  TextInput, // Prevent keyboard from converting inputs
  View, // Detect platform (iOS / Android)
} from 'react-native';


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

  // ------------------------------------------
  // RESULT STATE
  // ------------------------------------------
  // Stores calculated results 
  // null = no result yet 
  const [realBurn, setRealBurn] = useState<number | null>(null);
  const [deficit, setDeficit] = useState<number | null>(null);

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

    //Calculate deficit
    const def = avg - i;

    //Update state -> triggers UI re-render
    setRealBurn(avg);
    setDeficit(def);
  };
  
  // ------------------------------------------
  // UI RENDER
  // ------------------------------------------
  return (
    <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Kcal Rechner</Text>
      <TextInput 
      style = {styles.input}
      placeholder="Garmin Burn"
      keyboardType="numeric"
      value={garmin}
      onChangeText={setGarmin}
    />

    <TextInput 
      style = {styles.input}
      placeholder="Apple Burn"
      keyboardType="numeric"
      value={apple}
      onChangeText={setApple}
    />

    <TextInput
    style={styles.input}
    placeholder="Intake"
    keyboardType="numeric"
    value={intake}
    onChangeText={setIntake}
    />

    <Button title="Calculate" onPress={handleCalculate} />

    {realBurn !== null && (
      <View style={styles.result}>
        <Text style={styles.resultText}>
          Real Burn: {realBurn.toFixed(0)} kcal 
        </Text>
        <Text style={styles.resultText}>
          Deficit: {deficit?.toFixed(0)} kcal
        </Text>
      </View>
     )}
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
  },

  // Title styling
  title:{
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center'
  },

  // Input field styling
  input:{
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
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

});
