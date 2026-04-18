export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5';
export type MathType = 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'MISSING' | 'SHAPE';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface Challenge {
  id: string;
  grade: GradeLevel;
  type: MathType;
  difficulty: Difficulty;
  question: string;
  options: string[];
  answer: string;
}

export class MathEngine {
  static generate(grade: GradeLevel, difficulty: Difficulty = 'Easy'): Challenge {
    const types = this.getTypesForGrade(grade, difficulty);
    const type = types[Math.floor(Math.random() * types.length)];

    switch (type) {
      case 'SHAPE': return this.genShape(grade, difficulty);
      case 'MISSING': return this.genMissing(grade, difficulty);
      case 'ADD': return this.genAdd(grade, difficulty);
      case 'SUB': return this.genSub(grade, difficulty);
      case 'MUL': return this.genMul(grade, difficulty);
      case 'DIV': return this.genDiv(grade, difficulty);
      default: return this.genAdd(grade, difficulty);
    }
  }

  private static getTypesForGrade(grade: GradeLevel, diff: Difficulty): MathType[] {
    if (grade === 'K') return diff === 'Hard' ? ['ADD', 'SUB'] : ['SHAPE', 'ADD'];
    if (grade === '1') return diff === 'Easy' ? ['ADD'] : ['ADD', 'SUB', 'MISSING'];
    if (grade === '2') return ['ADD', 'SUB', 'MISSING', 'MUL'];
    return ['MUL', 'DIV', 'MISSING', 'ADD', 'SUB'];
  }

  private static genShape(grade: GradeLevel, diff: Difficulty): Challenge {
    const shapes = diff === 'Easy' 
      ? ['Circle ⭕', 'Square ⬛', 'Triangle 🔺'] 
      : ['Circle ⭕', 'Square ⬛', 'Triangle 🔺', 'Star ⭐', 'Heart ❤️', 'Diamond 💎'];
    const answer = shapes[Math.floor(Math.random() * shapes.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      grade,
      type: 'SHAPE',
      difficulty: diff,
      question: `Which one is the ${answer.split(' ')[0]}?`,
      options: this.shuffle(shapes),
      answer
    };
  }

  private static genAdd(grade: GradeLevel, diff: Difficulty): Challenge {
    let max = 10;
    if (grade === '1') max = diff === 'Easy' ? 15 : 25;
    if (grade === '2') max = diff === 'Hard' ? 100 : 50;
    if (parseInt(grade) >= 3) max = diff === 'Hard' ? 500 : 100;
    const a = Math.floor(Math.random() * max);
    const b = Math.floor(Math.random() * max);
    return this.createChallenge(grade, 'ADD', diff, `What is ${a} + ${b}?`, a + b);
  }

  private static genSub(grade: GradeLevel, diff: Difficulty): Challenge {
    const gradeNum = parseInt(grade) || 0;
    const max = gradeNum * 20 + 10;
    const a = Math.floor(Math.random() * max) + 5;
    const b = Math.floor(Math.random() * a);
    return this.createChallenge(grade, 'SUB', diff, `What is ${a} - ${b}?`, a - b);
  }

  private static genMissing(grade: GradeLevel, diff: Difficulty): Challenge {
    const max = diff === 'Hard' ? 50 : 20;
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const sum = a + b;
    const isFirstMissing = Math.random() > 0.5;
    return this.createChallenge(grade, 'MISSING', diff, 
      isFirstMissing ? `? + ${b} = ${sum}` : `${a} + ? = ${sum}`, 
      isFirstMissing ? a : b
    );
  }

  private static genMul(grade: GradeLevel, diff: Difficulty): Challenge {
    const max = diff === 'Easy' ? 5 : (diff === 'Medium' ? 10 : 12);
    const a = Math.floor(Math.random() * max) + 2;
    const b = Math.floor(Math.random() * 10) + 1;
    return this.createChallenge(grade, 'MUL', diff, `What is ${a} × ${b}?`, a * b);
  }

  private static genDiv(grade: GradeLevel, diff: Difficulty): Challenge {
    const max = diff === 'Hard' ? 12 : 10;
    const a = Math.floor(Math.random() * max) + 2;
    const b = Math.floor(Math.random() * 10) + 1;
    const product = a * b;
    return this.createChallenge(grade, 'DIV', diff, `What is ${product} ÷ ${a}?`, b);
  }

  private static createChallenge(grade: GradeLevel, type: MathType, diff: Difficulty, question: string, result: number): Challenge {
    const answer = result.toString();
    const options = [answer, (result + 1).toString(), (result - 1).toString(), (result + 2).toString()].filter(x => parseInt(x) >= 0);
    const uniqueOptions = Array.from(new Set(options));
    while (uniqueOptions.length < 4) {
       const extra = (result + Math.floor(Math.random() * 15) + 3).toString();
       if (!uniqueOptions.includes(extra)) uniqueOptions.push(extra);
    }
    return {
      id: Math.random().toString(36).substr(2, 9),
      grade,
      type,
      difficulty: diff,
      question,
      options: this.shuffle(uniqueOptions),
      answer
    };
  }

  private static shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }
}
