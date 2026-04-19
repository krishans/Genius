export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5';
export type MathType = 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'MISSING' | 'SHAPE' | 'FRACTION' | 'DECIMAL';

export interface Challenge {
  id: string; grade: GradeLevel; type: MathType; level: number; question: string; options: string[]; answer: string;
}

export class MathEngine {
  static generate(grade: GradeLevel, level: number, allowedTypes?: MathType[]): Challenge {
    const availableTypes = this.getTypesForGrade(grade, level);
    const types = allowedTypes && allowedTypes.length > 0 ? allowedTypes.filter(t => availableTypes.includes(t)) : availableTypes;
    const finalTypes = types.length > 0 ? types : availableTypes;
    const type = finalTypes[Math.floor(Math.random() * finalTypes.length)];

    switch (type) {
      case 'SHAPE': return this.genShape(grade, level);
      case 'MISSING': return this.genMissing(grade, level);
      case 'MUL': return this.genMul(grade, level);
      case 'DIV': return this.genDiv(grade, level);
      case 'FRACTION': return this.genFraction(grade, level);
      case 'DECIMAL': return this.genDecimal(grade, level);
      case 'SUB': return this.genSub(grade, level);
      default: return this.genAdd(grade, level);
    }
  }

  static getTypesForGrade(grade: GradeLevel, level: number): MathType[] {
    switch (grade) {
      case 'K': return level <= 3 ? ['SHAPE'] : ['ADD', 'SUB'];
      case '1': return level <= 7 ? ['ADD', 'SUB'] : ['ADD', 'SUB', 'MISSING'];
      case '2': return level <= 8 ? ['ADD', 'SUB', 'MISSING'] : ['ADD', 'SUB', 'MUL']; // MUL is intro to groups
      case '3': return level <= 4 ? ['ADD', 'SUB', 'MUL'] : ['MUL', 'DIV', 'FRACTION'];
      case '4': return ['MUL', 'DIV', 'FRACTION', 'ADD', 'SUB'];
      case '5': return ['MUL', 'DIV', 'FRACTION', 'DECIMAL'];
      default: return ['ADD'];
    }
  }

  private static genShape(grade: GradeLevel, level: number): Challenge {
    const shapes = level <= 5 ? ['Circle ⭕', 'Square ⬛', 'Triangle 🔺', 'Rectangle ▯'] : ['Cylinder 🥫', 'Sphere ⚽', 'Cube 🧊', 'Cone 🍦'];
    const answer = shapes[Math.floor(Math.random() * shapes.length)];
    return { id: Math.random().toString(36).substr(2, 9), grade, type: 'SHAPE', level, question: `Which one is the ${answer.split(' ')[0]}?`, options: this.shuffle(shapes), answer };
  }

  private static genAdd(grade: GradeLevel, level: number): Challenge {
    let a, b, max = 10;
    if (grade === 'K') max = level <= 5 ? 5 : 10;
    else if (grade === '1') max = level <= 5 ? 10 : 20;
    else if (grade === '2') max = level <= 5 ? 20 : 100;
    else if (grade === '3') max = 1000;
    else max = 10000;
    a = Math.floor(Math.random() * max); b = Math.floor(Math.random() * (max - a));
    return this.createChallenge(grade, 'ADD', level, `${a} + ${b} = ?`, a + b);
  }

  private static genSub(grade: GradeLevel, level: number): Challenge {
    let a, b, max = 10;
    if (grade === 'K') max = level <= 5 ? 5 : 10;
    else if (grade === '1') max = level <= 5 ? 10 : 20;
    else if (grade === '2') max = 100;
    else max = 1000;
    a = Math.floor(Math.random() * (max - 2)) + 2; b = Math.floor(Math.random() * a);
    return this.createChallenge(grade, 'SUB', level, `${a} - ${b} = ?`, a - b);
  }

  private static genMul(grade: GradeLevel, level: number): Challenge {
    let maxA = 10, maxB = 10;
    if (grade === '2') { maxA = 5; maxB = 2; } // Intro to multiplication
    else if (grade === '3') { maxA = 10; maxB = 10; } // Mastery of 10x10
    else if (grade === '4') { maxA = level <= 5 ? 100 : 1000; maxB = level <= 5 ? 9 : 99; }
    else { maxA = 1000; maxB = 100; }
    const a = Math.floor(Math.random() * maxA) + 1; const b = Math.floor(Math.random() * maxB) + 1;
    return this.createChallenge(grade, 'MUL', level, `${a} × ${b} = ?`, a * b);
  }

  private static genDiv(grade: GradeLevel, level: number): Challenge {
    let maxD = 10, maxQ = 10;
    if (grade === '3') { maxD = 10; maxQ = 10; }
    else if (grade === '4') { maxD = 9; maxQ = 100; }
    else { maxD = 25; maxQ = 100; }
    const d = Math.floor(Math.random() * maxD) + 1; const q = Math.floor(Math.random() * maxQ) + 1;
    return this.createChallenge(grade, 'DIV', level, `${d * q} ÷ ${d} = ?`, q);
  }

  private static genMissing(grade: GradeLevel, level: number): Challenge {
    const max = grade === '1' ? 10 : (grade === '2' ? 20 : 100);
    const a = Math.floor(Math.random() * max); const b = Math.floor(Math.random() * max);
    const isFirst = Math.random() > 0.5;
    return this.createChallenge(grade, 'MISSING', level, isFirst ? `? + ${b} = ${a+b}` : `${a} + ? = ${a+b}`, isFirst ? a : b);
  }

  private static genFraction(grade: GradeLevel, level: number): Challenge {
    const denoms = grade === '3' ? [2, 3, 4, 6, 8] : [2, 3, 4, 5, 6, 8, 10, 12];
    const d = denoms[Math.floor(Math.random() * denoms.length)];
    const n = Math.floor(Math.random() * (d - 1)) + 1;
    return { id: Math.random().toString(36).substr(2,9), grade, type: 'FRACTION', level, question: `Which is the fraction for ${n} out of ${d}?`, options: this.shuffle([`${n}/${d}`, `${n+1}/${d}`, `${n}/${d+1}`, `1/${d}`]), answer: `${n}/${d}` };
  }

  private static genDecimal(grade: GradeLevel, level: number): Challenge {
    const a = (Math.random() * 10).toFixed(level <= 5 ? 1 : 2);
    const b = (Math.random() * 10).toFixed(level <= 5 ? 1 : 2);
    const res = (parseFloat(a) + parseFloat(b)).toFixed(level <= 5 ? 1 : 2);
    return this.createChallenge(grade, 'DECIMAL', level, `${a} + ${b} = ?`, parseFloat(res));
  }

  private static createChallenge(grade: GradeLevel, type: MathType, level: number, question: string, result: number | string): Challenge {
    const answer = result.toString();
    const val = parseFloat(answer);
    const options = this.shuffle([answer, (val + 1).toString(), (val - 1).toString(), (val + (val > 10 ? 10 : 2)).toString()].filter(x => parseFloat(x) >= 0));
    const unique = Array.from(new Set(options));
    while (unique.length < 4) unique.push((val + unique.length + 5).toString());
    return { id: Math.random().toString(36).substr(2,9), grade, type, level, question, options: this.shuffle(unique), answer };
  }

  private static shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }
}
