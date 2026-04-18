export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5';
export type MathType = 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'MISSING' | 'SHAPE';

export interface Challenge {
  id: string;
  grade: GradeLevel;
  type: MathType;
  question: string;
  options: string[];
  answer: string;
  imageUrl?: string; // For future shape images
}

export class MathEngine {
  static generate(grade: GradeLevel): Challenge {
    const types: MathType[] = this.getTypesForGrade(grade);
    const type = types[Math.floor(Math.random() * types.length)];

    switch (type) {
      case 'SHAPE': return this.genShape(grade);
      case 'MISSING': return this.genMissing(grade);
      case 'ADD': return this.genAdd(grade);
      case 'SUB': return this.genSub(grade);
      case 'MUL': return this.genMul(grade);
      case 'DIV': return this.genDiv(grade);
      default: return this.genAdd(grade);
    }
  }

  private static getTypesForGrade(grade: GradeLevel): MathType[] {
    switch (grade) {
      case 'K': return ['SHAPE', 'ADD'];
      case '1': return ['ADD', 'SUB', 'MISSING'];
      case '2': return ['ADD', 'SUB', 'MISSING', 'MUL'];
      case '3': return ['MUL', 'DIV', 'MISSING'];
      case '4': return ['ADD', 'SUB', 'MUL', 'DIV', 'MISSING'];
      case '5': return ['MUL', 'DIV', 'MISSING'];
      default: return ['ADD'];
    }
  }

  private static genShape(grade: GradeLevel): Challenge {
    const shapes = ['Circle ⭕', 'Square ⬛', 'Triangle 🔺', 'Star ⭐', 'Heart ❤️'];
    const answer = shapes[Math.floor(Math.random() * shapes.length)];
    return {
      id: Math.random().toString(36).substr(2, 9),
      grade,
      type: 'SHAPE',
      question: `Which one is the ${answer.split(' ')[0]}?`,
      options: this.shuffle(shapes),
      answer
    };
  }

  private static genMissing(grade: GradeLevel): Challenge {
    const max = grade === '1' ? 10 : 20;
    const a = Math.floor(Math.random() * max) + 1;
    const b = Math.floor(Math.random() * max) + 1;
    const sum = a + b;
    const isFirstMissing = Math.random() > 0.5;
    
    return this.createChallenge(
      grade, 
      'MISSING', 
      isFirstMissing ? `? + ${b} = ${sum}` : `${a} + ? = ${sum}`, 
      isFirstMissing ? a : b
    );
  }

  private static genAdd(grade: GradeLevel): Challenge {
    const max = grade === 'K' ? 5 : (grade === '1' ? 15 : 50);
    const a = Math.floor(Math.random() * max);
    const b = Math.floor(Math.random() * (max - a + 5));
    return this.createChallenge(grade, 'ADD', `What is ${a} + ${b}?`, a + b);
  }

  private static genSub(grade: GradeLevel): Challenge {
    const a = Math.floor(Math.random() * 20) + 5;
    const b = Math.floor(Math.random() * a);
    return this.createChallenge(grade, 'SUB', `What is ${a} - ${b}?`, a - b);
  }

  private static genMul(grade: GradeLevel): Challenge {
    const max = grade === '2' ? 5 : 12;
    const a = Math.floor(Math.random() * max) + 2;
    const b = Math.floor(Math.random() * 10) + 1;
    return this.createChallenge(grade, 'MUL', `What is ${a} × ${b}?`, a * b);
  }

  private static genDiv(grade: GradeLevel): Challenge {
    const a = Math.floor(Math.random() * 10) + 2;
    const b = Math.floor(Math.random() * 10) + 1;
    const product = a * b;
    return this.createChallenge(grade, 'DIV', `What is ${product} ÷ ${a}?`, b);
  }

  private static createChallenge(grade: GradeLevel, type: MathType, question: string, result: number): Challenge {
    const answer = result.toString();
    const options = this.shuffle([
      answer,
      (result + 1).toString(),
      (result - 1).toString(),
      (result + (result > 5 ? 5 : 2)).toString()
    ].filter(x => parseInt(x) >= 0));
    
    const uniqueOptions = Array.from(new Set(options));
    while (uniqueOptions.length < 4) {
       const extra = (result + Math.floor(Math.random() * 10) + 3).toString();
       if (!uniqueOptions.includes(extra)) uniqueOptions.push(extra);
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      grade,
      type,
      question,
      options: this.shuffle(uniqueOptions),
      answer
    };
  }

  private static shuffle<T>(array: T[]): T[] {
    return array.sort(() => Math.random() - 0.5);
  }
}
