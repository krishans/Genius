export type GradeLevel = 'K' | '1' | '2' | '3' | '4' | '5';
export type MathType = 'ADD' | 'SUB' | 'MUL' | 'DIV' | 'MISSING' | 'SHAPE' | 'FRACTION' | 'DECIMAL' | 'MONEY' | 'VOLUME' | 'TIME' | 'MEASURE';

export interface ModuleInfo { id: number; name: string; types: MathType[]; }

export interface Challenge { id: string; grade: GradeLevel; type: MathType; level: number; question: string; options: string[]; answer: string; moduleId: number; }

export class MathEngine {
  static getModulesForGrade(grade: GradeLevel): ModuleInfo[] {
    switch (grade) {
      case 'K': return [{ id: 1, name: 'Numbers to 10', types: ['ADD'] }, { id: 2, name: 'Shapes', types: ['SHAPE'] }, { id: 4, name: 'Number Pairs', types: ['ADD', 'SUB'] }];
      case '1': return [{ id: 1, name: 'Sums to 10', types: ['ADD', 'SUB'] }, { id: 4, name: 'Place Value/Add to 100', types: ['ADD', 'MISSING'] }, { id: 5, name: 'Shapes', types: ['SHAPE'] }];
      case '2': return [{ id: 1, name: 'Sums to 100', types: ['ADD', 'SUB'] }, { id: 7, name: 'Money & Data', types: ['MONEY'] }, { id: 8, name: 'Sums to 1000', types: ['ADD', 'SUB', 'MISSING'] }];
      case '3': return [{ id: 1, name: 'Mul/Div (10x10)', types: ['MUL', 'DIV'] }, { id: 5, name: 'Fractions', types: ['FRACTION'] }, { id: 7, name: 'Geometry', types: ['SHAPE', 'ADD'] }];
      case '4': return [{ id: 3, name: 'Mul/Div Multi-Digit', types: ['MUL', 'DIV'] }, { id: 5, name: 'Fraction Ops', types: ['FRACTION'] }, { id: 6, name: 'Decimals', types: ['DECIMAL'] }];
      case '5': return [{ id: 1, name: 'Decimal Ops', types: ['DECIMAL'] }, { id: 3, name: 'Fraction Arith', types: ['FRACTION'] }, { id: 5, name: 'Volume & Area', types: ['VOLUME', 'MUL'] }];
      default: return [];
    }
  }

  static generate(grade: GradeLevel, level: number, allowedTypes?: MathType[]): Challenge {
    const modules = this.getModulesForGrade(grade);
    const availableTypes = this.getTypesForGrade(grade, level);
    const types = allowedTypes && allowedTypes.length > 0 ? allowedTypes.filter(t => availableTypes.includes(t)) : availableTypes;
    const finalTypes = types.length > 0 ? types : availableTypes;
    const type = finalTypes[Math.floor(Math.random() * finalTypes.length)];
    const moduleId = modules.find(m => m.types.includes(type))?.id || 1;
    let ch: any;
    switch (type) {
      case 'SHAPE': ch = this.genShape(grade, level); break;
      case 'MISSING': ch = this.genMissing(grade, level); break;
      case 'MUL': ch = this.genMul(grade, level); break;
      case 'DIV': ch = this.genDiv(grade, level); break;
      case 'FRACTION': ch = this.genFraction(grade, level); break;
      case 'DECIMAL': ch = this.genDecimal(grade, level); break;
      case 'MONEY': ch = this.genMoney(grade, level); break;
      case 'VOLUME': ch = this.genVolume(grade, level); break;
      case 'TIME': ch = this.genTime(grade, level); break;
      case 'MEASURE': ch = this.genMeasure(grade, level); break;
      case 'SUB': ch = this.genSub(grade, level); break;
      default: ch = this.genAdd(grade, level);
    }
    return { id: Math.random().toString(36).substr(2,9), ...ch, moduleId };
  }

  private static getTypesForGrade(grade: GradeLevel, level: number): MathType[] {
    switch (grade) {
      case 'K': return level <= 3 ? ['SHAPE'] : ['ADD', 'SUB'];
      case '1': return level <= 4 ? ['ADD', 'SUB'] : (level <= 8 ? ['MISSING'] : ['ADD', 'SUB', 'SHAPE']);
      case '2': return level <= 3 ? ['ADD', 'SUB'] : (level <= 6 ? ['MONEY'] : ['ADD', 'SUB', 'MISSING']);
      case '3': return level <= 5 ? ['MUL', 'DIV'] : (level <= 8 ? ['FRACTION'] : ['MUL', 'DIV', 'ADD', 'SUB']);
      case '4': return level <= 4 ? ['MUL', 'DIV'] : (level <= 7 ? ['FRACTION'] : ['DECIMAL', 'ADD', 'SUB']);
      case '5': return level <= 3 ? ['DECIMAL'] : (level <= 6 ? ['FRACTION'] : ['VOLUME', 'MUL', 'DIV']);
      default: return ['ADD'];
    }
  }

  private static genShape(grade: GradeLevel, level: number): any {
    const shapes = level <= 5 ? ['Circle ⭕', 'Square ⬛', 'Triangle 🔺', 'Rectangle ▯'] : ['Cylinder 🥫', 'Sphere ⚽', 'Cube 🧊', 'Cone 🍦'];
    const answer = shapes[Math.floor(Math.random() * shapes.length)];
    return { grade, type: 'SHAPE', level, question: `Which is the ${answer.split(' ')[0]}?`, options: this.shuffle(shapes), answer };
  }
  private static genAdd(grade: GradeLevel, level: number): any {
    let max = grade === 'K' ? 10 : (grade === '1' ? 20 : (grade === '2' ? 1000 : 10000));
    const a = Math.floor(Math.random() * max); const b = Math.floor(Math.random() * max);
    return this.createBasic(grade, 'ADD', level, `${a} + ${b} = ?`, a + b);
  }
  private static genSub(grade: GradeLevel, level: number): any {
    let max = grade === 'K' ? 10 : (grade === '1' ? 20 : (grade === '2' ? 1000 : 10000));
    const a = Math.floor(Math.random() * (max - 2)) + 2; const b = Math.floor(Math.random() * a);
    return this.createBasic(grade, 'SUB', level, `${a} - ${b} = ?`, a - b);
  }

  private static genMul(grade: GradeLevel, level: number): any {
    let mA=10, mB=10; if (grade==='2') { mA=5; mB=2; } else if (grade==='3') { mA=10; mB=10; } else if (grade==='4') { mA=100; mB=9; } else { mA=1000; mB=100; }
    const a = Math.floor(Math.random()*mA)+1; const b = Math.floor(Math.random()*mB)+1;
    return this.createBasic(grade,'MUL',level,`${a} × ${b} = ?`,a*b);
  }
  private static genDiv(grade: GradeLevel, level: number): any {
    let mD=10, mQ=10; if (grade==='3') { mD=10; mQ=10; } else if (grade==='4') { mD=9; mQ=100; } else { mD=99; mQ=100; }
    const d = Math.floor(Math.random()*mD)+1; const q = Math.floor(Math.random()*mQ)+1;
    return this.createBasic(grade,'DIV',level,`${d*q} ÷ ${d} = ?`,q);
  }
  private static genMissing(grade: GradeLevel, level: number): any {
    const max = grade==='1'?10:(grade==='2'?100:1000); const a = Math.floor(Math.random()*max); const b = Math.floor(Math.random()*max);
    return this.createBasic(grade,'MISSING',level,`? + ${b} = ${a+b}`,a);
  }
  private static genFraction(grade: GradeLevel, level: number): any {
    const denoms = grade==='3'?[2,3,4,6,8]:[2,3,4,5,6,8,10,12]; const d = denoms[Math.floor(Math.random()*denoms.length)]; const n = Math.floor(Math.random()*(d-1))+1;
    return { grade, type:'FRACTION', level, question:`Fraction for ${n} out of ${d}?`, options:this.shuffle([`${n}/${d}`,`${n+1}/${d}`,`${n}/${d+1}`,`1/${d}`]), answer:`${n}/${d}` };
  }

  private static genDecimal(grade: GradeLevel, level: number): any {
    const a = (Math.random()*10).toFixed(level<=5?1:2); const b = (Math.random()*10).toFixed(level<=5?1:2); const r = (parseFloat(a)+parseFloat(b)).toFixed(level<=5?1:2);
    return this.createBasic(grade,'DECIMAL',level,`${a} + ${b} = ?`,parseFloat(r));
  }
  private static genMoney(grade: GradeLevel, level: number): any {
    const a = Math.floor(Math.random()*100)+5; return this.createBasic(grade,'MONEY',level,`${a}¢ is how many cents?`,a);
  }
  private static genVolume(grade: GradeLevel, level: number): any {
    const l=Math.floor(Math.random()*5)+2, w=Math.floor(Math.random()*5)+2, h=Math.floor(Math.random()*5)+2;
    return this.createBasic(grade,'VOLUME',level,`Volume of ${l}x${w}x${h} box?`,l*w*h);
  }
  private static genTime(grade: GradeLevel, level: number): any {
    const h=Math.floor(Math.random()*12)+1, m=[0,15,30,45][Math.floor(Math.random()*4)];
    return { grade, type:'TIME', level, question:`Minutes past ${h} if clock is ${h}:${m===0?'00':m}?`, options:this.shuffle([`${m}`,`${m+5}`,`${m-5}`,'60']), answer:`${m}` };
  }
  private static genMeasure(grade: GradeLevel, level: number): any {
    const v = Math.floor(Math.random()*50)+1; return this.createBasic(grade,'MEASURE',level,`${v}m = ? cm`, v*100);
  }
  private static createBasic(grade:GradeLevel, type:MathType, level:number, question:string, result:number|string): any {
    const answer = result.toString(); const val = parseFloat(answer); const options = this.shuffle([answer,(val+1).toString(),(val-1).toString(),(val+2).toString()].filter(x => parseFloat(x)>=0));
    const unique = Array.from(new Set(options)); while (unique.length<4) unique.push((val+unique.length+5).toString());
    return { grade, type, level, question, options:this.shuffle(unique), answer };
  }
  private static shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }
}
