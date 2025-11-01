import { Intent } from './types';

export type Answer = string | boolean | number;

export interface Question {
  id: string;
  text: string;
  options?: string[];
  default?: Answer;
}

export interface HitlPlan {
  questions: Question[];
}

export interface HitlAnswers {
  [id: string]: Answer;
}

export function generateQuestions(intent: Intent): HitlPlan {
  const qs: Question[] = [];
  let idx = 1;
  for (const q of intent.questions) {
    const id = `q${idx++}`;
    const lower = q.toLowerCase();
    if (lower.includes('guest') || lower.includes('accounts')) {
      qs.push({ id, text: q, options: ['guest', 'accounts'], default: 'guest' });
    } else if (lower.includes('recurring')) {
      qs.push({ id, text: q, options: ['yes', 'no'], default: 'no' });
    } else if (lower.includes('permissions') || lower.includes('role')) {
      qs.push({ id, text: q, options: ['yes', 'no'], default: 'yes' });
    } else {
      qs.push({ id, text: q });
    }
  }
  return { questions: qs };
}

export function applyDefaults(plan: HitlPlan, answers?: Partial<HitlAnswers>): HitlAnswers {
  const out: HitlAnswers = {};
  for (const q of plan.questions) {
    const a = answers?.[q.id];
    const chosen: Answer =
      a !== undefined
        ? a
        : q.default !== undefined
        ? q.default
        : q.options && q.options.length
        ? q.options[0]
        : '';
    out[q.id] = chosen;
  }
  return out;
}
