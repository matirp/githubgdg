
import { User, Assessment, DrillType, ActivePackStatus, TrainingPack } from '../types';

const USERS_KEY = 'talentai_users';
const ASSESSMENTS_KEY = 'talentai_assessments';
const ACTIVE_PACK_KEY = 'talentai_active_pack';
const CURRENT_USER_ID = 'local-user-123';

export const TRAINING_PACKS: TrainingPack[] = [
  {
    id: 'strength-basics',
    name: 'Strength Basics',
    description: 'Build a solid foundation with essential upper and lower body movements.',
    icon: '🏋️',
    durationDays: 7,
    dailyDrills: [
      [DrillType.Squats, DrillType.PushUps],
      [DrillType.PlankHold, DrillType.ReverseLunges],
      [DrillType.BicepCurls, DrillType.Squats],
      [DrillType.Balance], // Recovery focus
      [DrillType.PushUps, DrillType.PlankHold],
      [DrillType.ReverseLunges, DrillType.Squats],
      [DrillType.PushUps, DrillType.Squats, DrillType.PlankHold]
    ]
  },
  {
    id: 'agility-starter',
    name: 'Agility Starter',
    description: 'Improve your reflexes, coordination, and explosive movement.',
    icon: '⚡',
    durationDays: 7,
    dailyDrills: [
      [DrillType.ReactionTime, DrillType.HighKnees],
      [DrillType.JumpingJacks, DrillType.Balance],
      [DrillType.HighKnees, DrillType.ReactionTime],
      [DrillType.Balance], // Recovery focus
      [DrillType.JumpingJacks, DrillType.HighKnees],
      [DrillType.ReactionTime, DrillType.Balance],
      [DrillType.ReactionTime, DrillType.HighKnees, DrillType.JumpingJacks]
    ]
  }
];

export const dbService = {
  getUser: (): User => {
    const data = localStorage.getItem(USERS_KEY);
    if (data) return JSON.parse(data);
    const defaultUser: User = {
      uid: CURRENT_USER_ID,
      email: 'athlete@talentai.com',
      full_name: 'John Doe',
      sport: 'Basketball',
      age: 22,
      height: 185,
      weight: 80,
      gender: 'Male'
    };
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  },

  updateUser: (userData: Partial<User>) => {
    const current = dbService.getUser();
    const updated = { ...current, ...userData };
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    return updated;
  },

  getAssessments: (): Assessment[] => {
    const data = localStorage.getItem(ASSESSMENTS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getPersonalBest: (drill: string): number | null => {
    const assessments = dbService.getAssessments().filter(a => a.drill === drill);
    if (assessments.length === 0) return null;
    
    if (drill === DrillType.ReactionTime) {
      return Math.min(...assessments.map(a => a.score));
    }
    return Math.max(...assessments.map(a => a.score));
  },

  addAssessment: (assessment: Omit<Assessment, 'id' | 'createdAt'>) => {
    const list = dbService.getAssessments();
    const newEntry: Assessment = {
      ...assessment,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    const newList = [newEntry, ...list];
    localStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(newList));
    return newEntry;
  },

  getDailyProgress: (): number => {
    const assessments = dbService.getAssessments();
    const today = new Date().toDateString();
    return assessments.filter(a => new Date(a.createdAt).toDateString() === today).length;
  },

  getStreak: (): number => {
    const assessments = dbService.getAssessments();
    if (assessments.length === 0) return 0;

    const uniqueDates = Array.from(new Set(
      assessments.map(a => new Date(a.createdAt).toDateString())
    )).map(d => new Date(d)).sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const firstDate = uniqueDates[0];
    const firstDateString = firstDate.toDateString();

    if (firstDateString !== today.toDateString() && firstDateString !== yesterday.toDateString()) {
      return 0;
    }

    let streak = 0;
    let currentDate = firstDateString === today.toDateString() ? today : yesterday;

    for (const date of uniqueDates) {
      if (date.toDateString() === currentDate.toDateString()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  },

  getActivePack: (): (ActivePackStatus & { pack: TrainingPack }) | null => {
    const data = localStorage.getItem(ACTIVE_PACK_KEY);
    if (!data) return null;
    const status: ActivePackStatus = JSON.parse(data);
    const pack = TRAINING_PACKS.find(p => p.id === status.packId);
    if (!pack) return null;
    return { ...status, pack };
  },

  startPack: (packId: string) => {
    const status: ActivePackStatus = {
      packId,
      startDate: new Date().toISOString()
    };
    localStorage.setItem(ACTIVE_PACK_KEY, JSON.stringify(status));
  },

  quitPack: () => {
    localStorage.removeItem(ACTIVE_PACK_KEY);
  }
};
