export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5';
export type MathType = 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'MISSING' | 'SHAPE';

export interface Challenge {
  id: string;
  grade: GradeLevel;
  type: MathType;
  level: number; // 1-10
  question: string;
  options: string[];
  answer: string;
}

export class MathEngine {
  static generate(grade: GradeLevel, level: number = 1): Challenge {
    const types = this.getTypesForGrade(grade, level);
    const type = types[Math.floor(Math.random() * types.length)];

    switch (type) {
      case 'SHAPE': return this.genShape(grade, level);
      case 'MISSING': return this.genMissing(grade, level);
      case 'ADD': return this.genAdd(grade, level);
      case 'SUB': return this.genSub(grade, level);
      case 'MUL': return this.genMul(grade, level);
      case 'DIV': return this.genDiv(grade, level);
      default: return this.genAdd(grade, level);
    }
  }

  private static getTypesForGrade(grade: GradeLevel, level: number): MathType[] {
    if (grade === 'K') return level > 7 ? ['ADD', 'SUB'] : ['SHAPE', 'ADD'];
    if (grade === '1') return level < 4 ? ['ADD'] : ['ADD', 'SUB', 'MISSING'];
    if (grade === '2') return level < 5 ? ['ADD', 'SUB'] : ['ADD', 'SUB', 'MISSING', 'MUL'];
    return ['MUL', 'DIV', 'MISSING', 'ADD', 'SUB'];
  }

  private static genShape(grade: GradeLevel, level: number): Challenge {
    const shapes = level < 5 
      ? ['Circle ⭕', 'Square ⬛', 'Triangle 🔺'] 
      : ['Circle ⭕', 'Square ⬛', 'Triangle 🔺', 'Star ⭐', 'Heart ❤️', 'Diamond 💎', 'Hexagon ⬢'];
    const answer = shapes[Math.floor(Math.random() * shapes.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      grade,
      type: 'SHAPE',
      level,
      question: `Which one is the ${answer.split(' ')[0]}?`,
      options: this.shuffle(shapes),
      answer
    };
  }

  private static genAdd(grade: GradeLevel, level: number): Challenge {
    let max = 10 + (level * 5);
    if (grade === 'K') max = 5 + level;
    if (parseInt(grade) >= 3) max = 20 * level;
    const a = Math.floor(Math.random() * max);
    const b = Math.floor(Math.random() * max);
    return this.createChallenge(grade, 'ADD', level, `What is ${a} + ${b}?`, a + b);
  }

  private static genSub(grade: GradeLevel, level: number): Challenge {
    const max = (parseInt(grade) || 1) * 10 + (level * 5);
    const a = Math.floor(Math.random() * max) + level;
    const b = Math.floor(Math.random() * a);
    return this.createChallenge(grade, 'SUB', level, `What is ${a} - ${b}?`, a - b);
  }

  private static genMissing(grade: GradeLevel, level: number): Challenge {
    const max = 5 + (level * 3);
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const sum = a + b;
    const isFirstMissing = Math.random() > 0.5;
    return this.createChallenge(grade, 'MISSING', level, 
      isFirstMissing ? `? + ${b} = ${sum}` : `${a} + ? = ${sum}`, 
      isFirstMissing ? a : b
    );
  }

  private static genMul(grade: GradeLevel, level: number): Challenge {
    const max = 2 + Math.floor(level / 1.5);
    const a = Math.floor(Math.random() * max) + 2;
    const b = Math.floor(Math.random() * 10) + 1;
    return this.createChallenge(grade, 'MUL', level, `What is ${a} × ${b}?`, a * b);
  }

  private static genDiv(grade: GradeLevel, level: number): Challenge {
    const max = 2 + Math.floor(level / 2);
    const a = Math.floor(Math.random() * max) + 2;
    const b = Math.floor(Math.random() * 10) + 1;
    const product = a * b;
    return this.createChallenge(grade, 'DIV', level, `What is ${product} ÷ ${a}?`, b);
  }

  private static createChallenge(grade: GradeLevel, type: MathType, level: number, question: string, result: number): Challenge {
    const answer = result.toString();
    const options = [answer, (result + 1).toString(), (result - 1).toString(), (result + (result > 10 ? 10 : 2)).toString()].filter(x => parseInt(x) >= 0);
    const uniqueOptions = Array.from(new Set(options));
    while (uniqueOptions.length < 4) {
       const extra = (result + Math.floor(Math.random() * 20) + 3).toString();
       if (!uniqueOptions.includes(extra)) uniqueOptions.push(extra);
    }
    return {
      id: Math.random().toString(36).substr(2, 9),
      grade,
      type,
      level,
      question,
      options: this.shuffle(uniqueOptions),
      answer
    };
  }

  private static shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }
}
