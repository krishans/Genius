export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5';
export type MathType = 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'MISSING' | 'SHAPE' | 'DECIMAL';

export interface Challenge {
  id: string;
  grade: GradeLevel;
  type: MathType;
  level: number;
  question: string;
  options: string[];
  answer: string;
}

export class MathEngine {
  static generate(grade: GradeLevel, level: number): Challenge {
    const types = this.getTypesForGrade(grade, level);
    const type = types[Math.floor(Math.random() * types.length)];

    switch (type) {
      case 'SHAPE': return this.genShape(grade, level);
      case 'MISSING': return this.genMissing(grade, level);
      case 'MUL': return this.genMul(grade, level);
      case 'DIV': return this.genDiv(grade, level);
      case 'DECIMAL': return this.genDecimal(grade, level);
      case 'SUB': return this.genSub(grade, level);
      default: return this.genAdd(grade, level);
    }
  }

  private static getTypesForGrade(grade: GradeLevel, level: number): MathType[] {
    switch (grade) {
      case 'K': return level <= 5 ? ['SHAPE', 'ADD'] : ['ADD', 'SUB'];
      case '1': return level <= 3 ? ['ADD', 'SUB'] : ['ADD', 'SUB', 'MISSING'];
      case '2': return ['ADD', 'SUB', 'MISSING'];
      case '3': return level <= 5 ? ['MUL', 'DIV', 'ADD', 'SUB'] : ['MUL', 'DIV', 'MISSING'];
      case '4': return ['MUL', 'DIV', 'ADD', 'SUB', 'MISSING'];
      case '5': return ['MUL', 'DIV', 'DECIMAL', 'MISSING'];
      default: return ['ADD'];
    }
  }

  private static genShape(grade: GradeLevel, level: number): Challenge {
    const shapes = level < 5 
      ? ['Circle ⭕', 'Square ⬛', 'Triangle 🔺', 'Rectangle ▯'] 
      : ['Cylinder 🥫', 'Sphere ⚽', 'Cube 🧊', 'Cone 🍦', 'Star ⭐'];
    const answer = shapes[Math.floor(Math.random() * shapes.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      grade, type: 'SHAPE', level,
      question: `Which one is the ${answer.split(' ')[0]}?`,
      options: this.shuffle(shapes),
      answer
    };
  }

  private static genAdd(grade: GradeLevel, level: number): Challenge {
    let a, b, max;
    if (grade === 'K') max = level <= 5 ? 5 : 10;
    else if (grade === '1') max = level <= 5 ? 10 : 20;
    else if (grade === '2') max = level <= 5 ? 20 : 100;
    else if (grade === '3') max = 1000;
    else max = 1000 * (level / 2);
    a = Math.floor(Math.random() * max); b = Math.floor(Math.random() * (max - a));
    return this.createChallenge(grade, 'ADD', level, `${a} + ${b} = ?`, a + b);
  }

  private static genSub(grade: GradeLevel, level: number): Challenge {
    let a, b, max;
    if (grade === 'K') max = level <= 5 ? 5 : 10;
    else if (grade === '1') max = level <= 5 ? 10 : 20;
    else if (grade === '2') max = 100;
    else max = 1000;
    a = Math.floor(Math.random() * (max - 2)) + 2; b = Math.floor(Math.random() * a);
    return this.createChallenge(grade, 'SUB', level, `${a} - ${b} = ?`, a - b);
  }

  private static genMul(grade: GradeLevel, level: number): Challenge {
    let a, b, maxA = 10, maxB = 10;
    if (grade === '4') { maxA = level <= 5 ? 100 : 1000; maxB = level <= 5 ? 9 : 99; }
    else if (grade === '5') { maxA = 1000; maxB = 100; }
    a = Math.floor(Math.random() * maxA) + 2; b = Math.floor(Math.random() * maxB) + 1;
    return this.createChallenge(grade, 'MUL', level, `${a} × ${b} = ?`, a * b);
  }

  private static genDiv(grade: GradeLevel, level: number): Challenge {
    let divisor, quotient, maxDiv = 10, maxQ = 10;
    if (grade === '4') { maxDiv = 9; maxQ = 1000; }
    else if (grade === '5') { maxDiv = 99; maxQ = 100; }
    divisor = Math.floor(Math.random() * maxDiv) + 1; quotient = Math.floor(Math.random() * maxQ) + 1;
    return this.createChallenge(grade, 'DIV', level, `${divisor * quotient} ÷ ${divisor} = ?`, quotient);
  }

  private static genDecimal(grade: GradeLevel, level: number): Challenge {
    const a = (Math.random() * 10).toFixed(2); const b = (Math.random() * 10).toFixed(2);
    const sum = (parseFloat(a) + parseFloat(b)).toFixed(2);
    return this.createChallenge(grade, 'DECIMAL', level, `${a} + ${b} = ?`, parseFloat(sum));
  }

  private static genMissing(grade: GradeLevel, level: number): Challenge {
    const max = 20 + (level * 5); const a = Math.floor(Math.random() * max) + 1; const b = Math.floor(Math.random() * max) + 1;
    const isFirst = Math.random() > 0.5;
    return this.createChallenge(grade, 'MISSING', level, isFirst ? `? + ${b} = ${a+b}` : `${a} + ? = ${a+b}`, isFirst ? a : b);
  }

  private static createChallenge(grade: GradeLevel, type: MathType, level: number, question: string, result: number): Challenge {
    const answer = result.toString();
    const options = this.shuffle([answer, (result + 1).toString(), (result - 1).toString(), (result + 5).toString()].filter(x => parseFloat(x) >= 0));
    const unique = Array.from(new Set(options));
    while (unique.length < 4) unique.push((result + unique.length + 2).toString());
    return { id: Math.random().toString(36).substr(2,9), grade, type, level, question, options: this.shuffle(unique), answer };
  }
  private static shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }
}
