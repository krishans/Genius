export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5';
export type MathType = 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'MISSING' | 'SHAPE';

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
      case 'SUB': return this.genSub(grade, level);
      default: return this.genAdd(grade, level);
    }
  }

  private static getTypesForGrade(grade: GradeLevel, level: number): MathType[] {
    switch (grade) {
      case 'K': 
        if (level <= 3) return ['SHAPE', 'ADD'];
        if (level <= 7) return ['ADD', 'SUB'];
        return ['ADD', 'SUB', 'MISSING'];
      case '1':
        if (level <= 3) return ['ADD', 'SUB'];
        return ['ADD', 'SUB', 'MISSING'];
      case '2':
        if (level <= 5) return ['ADD', 'SUB', 'MISSING'];
        return ['ADD', 'SUB', 'MUL', 'MISSING'];
      case '3':
        if (level <= 3) return ['MUL', 'ADD', 'SUB'];
        return ['MUL', 'DIV', 'MISSING'];
      case '4':
      case '5':
        return ['MUL', 'DIV', 'MISSING', 'ADD', 'SUB'];
      default:
        return ['ADD'];
    }
  }

  private static genShape(grade: GradeLevel, level: number): Challenge {
    const allShapes = ['Circle ⭕', 'Square ⬛', 'Triangle 🔺', 'Star ⭐', 'Heart ❤️', 'Diamond 💎', 'Hexagon ⬢', 'Oval 🥚'];
    const count = Math.min(3 + Math.floor(level / 2), 8);
    const shapes = this.shuffle(allShapes).slice(0, count);
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
    const gradeScale = grade === 'K' ? 1 : parseInt(grade);
    const max = 5 + (gradeScale * 10) + (level * 5);
    const a = Math.floor(Math.random() * max);
    const b = Math.floor(Math.random() * max);
    return this.createChallenge(grade, 'ADD', level, `${a} + ${b} = ?`, a + b);
  }

  private static genSub(grade: GradeLevel, level: number): Challenge {
    const gradeScale = grade === 'K' ? 1 : parseInt(grade);
    const max = 5 + (gradeScale * 10) + (level * 5);
    const a = Math.floor(Math.random() * (max - 2)) + 2;
    const b = Math.floor(Math.random() * a);
    return this.createChallenge(grade, 'SUB', level, `${a} - ${b} = ?`, a - b);
  }

  private static genMissing(grade: GradeLevel, level: number): Challenge {
    const gradeScale = grade === 'K' ? 1 : parseInt(grade);
    const max = 5 + (gradeScale * 5) + (level * 2);
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
    const gradeNum = parseInt(grade);
    let maxA = 5, maxB = 5;
    
    if (gradeNum === 2) { maxA = level <= 5 ? 2 : 5; maxB = 10; }
    else if (gradeNum === 3) { maxA = 10; maxB = 10; }
    else { maxA = 10 + level; maxB = 10 + Math.floor(level/2); }

    const a = Math.floor(Math.random() * maxA) + 1;
    const b = Math.floor(Math.random() * maxB) + 1;
    return this.createChallenge(grade, 'MUL', level, `${a} × ${b} = ?`, a * b);
  }

  private static genDiv(grade: GradeLevel, level: number): Challenge {
    const gradeNum = parseInt(grade);
    let maxDivisor = 5, maxQuotient = 5;
    
    if (gradeNum === 3) { maxDivisor = 5 + Math.floor(level/2); maxQuotient = 10; }
    else { maxDivisor = 10 + Math.floor(level/3); maxQuotient = 10 + Math.floor(level/2); }

    const quotient = Math.floor(Math.random() * maxQuotient) + 1;
    const divisor = Math.floor(Math.random() * maxDivisor) + 1;
    const dividend = quotient * divisor;
    return this.createChallenge(grade, 'DIV', level, `${dividend} ÷ ${divisor} = ?`, quotient);
  }

  private static createChallenge(grade: GradeLevel, type: MathType, level: number, question: string, result: number): Challenge {
    const answer = result.toString();
    const options = [
      answer,
      (result + 1).toString(),
      (result - 1).toString(),
      (result + (result > 10 ? 10 : 2)).toString()
    ].filter(x => parseInt(x) >= 0);
    
    const uniqueOptions = Array.from(new Set(options));
    while (uniqueOptions.length < 4) {
       const extra = (result + Math.floor(Math.random() * 20) + 3).toString();
       if (!uniqueOptions.includes(extra)) uniqueOptions.push(extra);
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      grade, type, level, question,
      options: this.shuffle(uniqueOptions),
      answer
    };
  }

  private static shuffle<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }
}
