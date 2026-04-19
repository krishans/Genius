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
  static generate(grade: GradeLevel, level: number, allowedTypes?: MathType[]): Challenge {
    const availableTypes = this.getTypesForGrade(grade, level);
    const types = allowedTypes && allowedTypes.length > 0 
      ? allowedTypes.filter(t => availableTypes.includes(t))
      : availableTypes;
    
    const finalTypes = types.length > 0 ? types : availableTypes;
    const type = finalTypes[Math.floor(Math.random() * finalTypes.length)];

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

  static getTypesForGrade(grade: GradeLevel, level: number): MathType[] {
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
    return { id: Math.random().toString(36).substr(2, 9), grade, type: 'SHAPE', level, question: `Which one is the ${answer.split(' ')[0]}?`, options: this.shuffle(shapes), answer };
  }

  private static genAdd(grade: GradeLevel, level: number): Challenge {
    let max = 10; if (grade === 'K') max = 10; else if (grade === '1') max = 20; else if (grade === '2') max = 100; else max = 1000; 
    const a = Math.floor(Math.random() * max); const b = Math.floor(Math.random() * max);
    return this.createChallenge(grade, 'ADD', level, `${a} + ${b} = ?`, a + b);
  }

  private static genSub(grade: GradeLevel, level: number): Challenge {
    const max = (parseInt(grade) || 1) * 20; const a = Math.floor(Math.random() * max) + 5; const b = Math.floor(Math.random() * a);
    return this.createChallenge(grade, 'SUB', level, `${a} - ${b} = ?`, a - b);
  }

  private static genMul(grade: GradeLevel, level: number): Challenge {
    const max = 10 + Math.floor(level/2); const a = Math.floor(Math.random() * 10) + 1; const b = Math.floor(Math.random() * max);
    return this.createChallenge(grade, 'MUL', level, `${a} × ${b} = ?`, a * b);
  }

  private static genDiv(grade: GradeLevel, level: number): Challenge {
    const divisor = Math.floor(Math.random() * 10) + 1; const quotient = Math.floor(Math.random() * 10) + 1;
    return this.createChallenge(grade, 'DIV', level, `${divisor * quotient} ÷ ${divisor} = ?`, quotient);
  }

  private static genDecimal(grade: GradeLevel, level: number): Challenge {
    const a = (Math.random() * 10).toFixed(1); const b = (Math.random() * 10).toFixed(1);
    const res = (parseFloat(a) + parseFloat(b)).toFixed(1);
    return this.createChallenge(grade, 'DECIMAL', level, `${a} + ${b} = ?`, parseFloat(res));
  }

  private static genMissing(grade: GradeLevel, level: number): Challenge {
    const a = Math.floor(Math.random() * 10) + 1; const b = Math.floor(Math.random() * 10) + 1;
    return this.createChallenge(grade, 'MISSING', level, `? + ${b} = ${a+b}`, a);
  }

  private static createChallenge(grade: GradeLevel, type: MathType, level: number, question: string, result: number | string): Challenge {
    const answer = result.toString();
    const options = this.shuffle([answer, (parseFloat(answer) + 1).toString(), (parseFloat(answer) - 1).toString(), (parseFloat(answer) + 2).toString()].filter(x => parseFloat(x) >= 0));
    const unique = Array.from(new Set(options));
    while (unique.length < 4) unique.push((parseFloat(answer) + unique.length + 3).toString());
    return { id: Math.random().toString(36).substr(2,9), grade, type, level, question, options: this.shuffle(unique), answer };
  }
  private static shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }
}
