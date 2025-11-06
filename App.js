import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

const CalcButton = ({ label, style, textStyle, onPress }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={() => onPress && onPress(label)} activeOpacity={0.7}>
    <Text style={[styles.buttonText, textStyle]}>{label}</Text>
  </TouchableOpacity>
);

export default function App() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const isOperator = (ch) => ['/', '-', 'X', '÷', '*', '+'].includes(ch);

  const append = (val) => {
    // typing clears previous computed result
    if (result) setResult('');

    // Prevent multiple operators in a row
    if (isOperator(val)) {
      if (input === '') return; // don't start with operator
      const last = input.slice(-1);
      if (isOperator(last)) {
        // replace last operator
        setInput((s) => s.slice(0, -1) + val);
        return;
      }
      setInput((s) => s + val);
      return;
    }

    // Handle decimal: prevent multiple decimals in the current number
    if (val === '.') {
      // find last operator to get current number
      const m = input.match(/([^*/\-+÷X]*)$/);
      const current = m ? m[0] : input;
      if (current.includes('.')) return;
      // if current number is empty (user pressed '.' after operator), prefix with 0
      if (current === '') {
        setInput((s) => s + '0.');
      } else {
        setInput((s) => s + '.');
      }
      return;
    }

    // number
    setInput((s) => s + val);
  };

  const handleDelete = () => {
    setResult('');
    setInput((s) => (s.length > 0 ? s.slice(0, -1) : ''));
  };

  const handlePercent = () => {
    // convert last number to percentage (divide by 100)
    const match = input.match(/(\d+\.?\d*)$/);
    if (!match) return;
    const num = parseFloat(match[0]);
    const replaced = (num / 100).toString();
    setResult('');
    setInput((s) => s.slice(0, -match[0].length) + replaced);
  };

  const toJsExpr = (expr) => expr.replace(/X/g, '*').replace(/÷/g, '/');

  const handleAnswer = () => {
    if (!input) return;
    // trim trailing operator
    let expr = input;
    while (expr.length > 0 && isOperator(expr.slice(-1))) expr = expr.slice(0, -1);
    if (expr === '') return;
    const jsExpr = toJsExpr(expr);
    try {
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict"; return (${jsExpr})`)();
      if (typeof result === 'number' && !Number.isNaN(result) && Number.isFinite(result)) {
        // keep the formula (input) as-is, show the answer in separate result area
        setResult(Number.isInteger(result) ? String(result) : String(parseFloat(result.toFixed(10)).replace(/(?:\.0+|(?:(\.[0-9]*?)0+))$/,'$1')));
      } else {
        setResult('Error');
      }
    } catch (e) {
      setResult('Error');
    }
  };

  const onPress = (label) => {
    if (label === 'Delete') return handleDelete();
    if (label === 'Answer') return handleAnswer();
    if (label === '%') return handlePercent();
    // forward other buttons
    append(label);
  };

  const computePreview = (expr) => {
    if (!expr) return '';
    // remove trailing operators
    let e = expr;
    while (e.length > 0 && isOperator(e.slice(-1))) e = e.slice(0, -1);
    if (e === '') return '';
    const jsExpr = toJsExpr(e);
    try {
      // eslint-disable-next-line no-new-func
      const r = Function(`"use strict"; return (${jsExpr})`)();
      if (typeof r === 'number' && !Number.isNaN(r) && Number.isFinite(r)) {
        // trim unnecessary decimals
        return Number.isInteger(r) ? String(r) : String(parseFloat(r.toFixed(10)).replace(/(?:\.0+|(?:(\.[0-9]*?)0+))$/,'$1'));
      }
      return '';
    } catch (e) {
      return '';
    }
  };

  const formatForDisplay = (expr) => {
    if (!expr) return '0';
    // add spaces around operators and convert * and / to X and ÷ for display
    return expr.replace(/\*/g, ' X ').replace(/\//g, ' ÷ ').replace(/([+\-X÷])/g, ' $1 ').replace(/\s+/g, ' ').trim();
  };

  const preview = computePreview(input);
  const displayResult = result !== '' ? result : preview;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.headerText}>Calculator</Text>
      </View>

      <View style={styles.display}>
        <Text style={styles.formulaText}>{input === '' ? '0' : formatForDisplay(input) + (displayResult ? ' =' : '')}</Text>
        <Text style={styles.resultText}>{displayResult === '' ? (input === '' ? '0' : '') : displayResult}</Text>
      </View>

      <View style={styles.pad}>
        <View style={styles.actionRow}>
          <CalcButton label="Delete" style={styles.actionButton} textStyle={styles.actionButtonText} onPress={onPress} />
          <CalcButton label="Answer" style={styles.actionButton} textStyle={styles.actionButtonText} onPress={onPress} />
        </View>

        {/* Row 1 */}
        <View style={styles.row}>
          <CalcButton label="1" onPress={onPress} />
          <CalcButton label="2" onPress={onPress} />
          <CalcButton label="3" onPress={onPress} />
          <CalcButton label="/" style={styles.opButton} onPress={onPress} />
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <CalcButton label="4" onPress={onPress} />
          <CalcButton label="5" onPress={onPress} />
          <CalcButton label="6" onPress={onPress} />
          <CalcButton label="-" style={styles.opButton} onPress={onPress} />
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          <CalcButton label="7" onPress={onPress} />
          <CalcButton label="8" onPress={onPress} />
          <CalcButton label="9" onPress={onPress} />
          <CalcButton label="X" style={styles.opButton} onPress={onPress} />
        </View>

        {/* Row 4 */}
        <View style={styles.row}>
          <CalcButton label="." onPress={onPress} />
          <CalcButton label="0" onPress={onPress} />
          <CalcButton label="%" style={styles.opButton} onPress={onPress} />
          <CalcButton label="+" style={styles.opButton} onPress={onPress} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    height: 60,
    backgroundColor: '#09b5a4',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  headerText: {
    color: '#d2e5ed',
    fontSize: 22,
    fontWeight: '700',
  },
  display: {
    height: 140,
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  formulaText: {
    color: '#9aa6ad',
    fontSize: 16,
    textAlign: 'right',
    marginBottom: 6,
  },
  resultText: {
    color: '#9aa6ad',
    alignSelf: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontSize: 44,
    fontWeight: '700',
    textAlign: 'right',
    minWidth: 100,
  },
  actionRow: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: 8,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: '#4aa3e0',
    height: 64,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#d2e5ed',
    fontSize: 18,
    fontWeight: '700',
  },
  pad: {
    flex: 1,
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingBottom: 12,
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  button: {
    flex: 1,
    backgroundColor: '#1d6fb3',
    marginHorizontal: 1,
    height: 64,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  opButton: {
    backgroundColor: '#67c7c2',
  },
});
