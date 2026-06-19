// src/app/controllers/ProfileController.ts

import { databases, account } from '@/lib/appwrite';
import { ID, Query } from 'appwrite';
import { UserProfile, UserInteraction, defaultProfile } from '../models/UserProfile';

const DB_ID         = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
const PROFILES_COL  = process.env.NEXT_PUBLIC_APPWRITE_USER_PROFILES_COLLECTION_ID!;
const INTERACT_COL  = process.env.NEXT_PUBLIC_APPWRITE_USER_INTERACTIONS_COLLECTION_ID!;
const FLASK_URL     = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://localhost:5000';

// ─── Quiz answer types ────────────────────────────────────────────────────────
export interface QuizAnswers {
  motivation:   'express' | 'social' | 'comfort' | 'impress';
  newClothing:  'buy_it' | 'consider' | 'pass';
  palette:      'vivid' | 'mixed' | 'earth' | 'neutrals';
  styleWord:    'minimal' | 'urban' | 'classic' | 'experimental';
  occasion:     'work' | 'social' | 'sport' | 'home';
  trendScale:   1 | 2 | 3 | 4 | 5;
  contexts:     string[]; // múltiples selecciones
}

// ─── Mapeo determinístico quiz → coordenadas ──────────────────────────────────
export const quizToProfile = (
  userId: string,
  answers: QuizAnswers
): Omit<UserProfile, '$id'> => {
  const identity =
    answers.motivation === 'express'  ? 0.9 :
    answers.motivation === 'social'   ? 0.6 :
    answers.motivation === 'impress'  ? 0.5 : 0.2;

  const risk =
    answers.newClothing === 'buy_it'   ? 0.9 :
    answers.newClothing === 'consider' ? 0.5 : 0.1;

  const formality =
    answers.occasion === 'work'   ? 0.8 :
    answers.occasion === 'social' ? 0.5 :
    answers.occasion === 'sport'  ? 0.1 : 0.3;

  const colorIntensity =
    answers.palette === 'vivid'    ? 0.9 :
    answers.palette === 'mixed'    ? 0.55 :
    answers.palette === 'earth'    ? 0.35 : 0.1;

  const trendOrientation = answers.trendScale / 5.0;

  const occasionDiversity = Math.min(answers.contexts.length / 4.0, 1.0);

  const styleKeywordMap: Record<string, string> = {
    minimal:      'minimal',
    urban:        'urban',
    classic:      'classic',
    experimental: 'experimental',
  };

  return {
    userId,
    coord_identity:          identity,
    coord_risk:              risk,
    coord_formality:         formality,
    coord_colorIntensity:    colorIntensity,
    coord_trendOrientation:  trendOrientation,
    coord_occasionDiversity: occasionDiversity,
    profileVersion:          1,
    interactionsCount:       0,
    quizCompleted:           true,
    styleKeyword:            styleKeywordMap[answers.styleWord],
    dominantOccasion:        answers.occasion,
    lastRefined:             new Date().toISOString(),
  };
};

// ─── Controller ───────────────────────────────────────────────────────────────
export const profileController = {

  // Crear perfil vacío al registrarse (antes del quiz)
  async createDefaultProfile(userId: string): Promise<UserProfile> {
    const data = defaultProfile(userId);
    const doc = await databases.createDocument(
      DB_ID, PROFILES_COL, ID.unique(), data
    );
    return doc as unknown as UserProfile;
  },

  // Guardar resultado del quiz
  async saveQuizProfile(userId: string, answers: QuizAnswers): Promise<UserProfile> {
    const profileData = quizToProfile(userId, answers);

    // Buscar si ya existe un perfil para este usuario
    const existing = await this.getProfile(userId);

    if (existing?.$id) {
      const doc = await databases.updateDocument(
        DB_ID, PROFILES_COL, existing.$id, profileData
      );
      return doc as unknown as UserProfile;
    }

    const doc = await databases.createDocument(
      DB_ID, PROFILES_COL, ID.unique(), profileData
    );
    return doc as unknown as UserProfile;
  },

  // Obtener perfil del usuario actual
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const res = await databases.listDocuments(DB_ID, PROFILES_COL, [
        Query.equal('userId', userId),
        Query.limit(1),
      ]);
      if (res.documents.length === 0) return null;
      return res.documents[0] as unknown as UserProfile;
    } catch {
      return null;
    }
  },

  // Verificar si el usuario completó el quiz
  async hasCompletedQuiz(userId: string): Promise<boolean> {
    const profile = await this.getProfile(userId);
    return profile?.quizCompleted ?? false;
  },

  // Registrar una interacción del usuario
  async recordInteraction(
    userId: string,
    outfitId: string,
    action: UserInteraction['action'],
    outfitFeatures: {
      colorIntensity: number;
      formalityLevel: number;
      styleExperimental: number;
      occasionType?: string;
    }
  ): Promise<void> {
    const interaction: Omit<UserInteraction, '$id'> = {
      userId,
      outfitId,
      action,
      colorIntensity:    outfitFeatures.colorIntensity,
      formalityLevel:    outfitFeatures.formalityLevel,
      styleExperimental: outfitFeatures.styleExperimental,
      occasionType:      outfitFeatures.occasionType,
      timestamp:         new Date().toISOString(),
    };

    await databases.createDocument(
      DB_ID, INTERACT_COL, ID.unique(), interaction
    );

    // Obtener el conteo actual y disparar refinamiento cada 5 interacciones
    const profile = await this.getProfile(userId);
    if (!profile) return;

    const newCount = profile.interactionsCount + 1;
    await databases.updateDocument(DB_ID, PROFILES_COL, profile.$id!, {
      interactionsCount: newCount,
    });

    if (newCount % 5 === 0) {
      await this.triggerRefinement(userId, profile);
    }
  },

  // Guardar tono de piel detectado
  async saveSkinTone(userId: string, skinTone: string): Promise<void> {
    const profile = await this.getProfile(userId);
    if (!profile) return;
    await databases.updateDocument(DB_ID, PROFILES_COL, profile.$id!, { skinTone });
  },

  async saveBodyType(userId: string, bodyType: string): Promise<void> {
    const profile = await this.getProfile(userId);
    if (!profile) return;
    await databases.updateDocument(DB_ID, PROFILES_COL, profile.$id!, { bodyType });
  },

  // Disparar el refinamiento en Flask
  async triggerRefinement(userId: string, currentProfile: UserProfile): Promise<void> {
    try {
      // Traer las últimas 20 interacciones
      const res = await databases.listDocuments(DB_ID, INTERACT_COL, [
        Query.equal('userId', userId),
        Query.orderDesc('timestamp'),
        Query.limit(20),
      ]);

      const interactions = res.documents.map(doc => ({
        action:            doc.action,
        colorIntensity:    doc.colorIntensity,
        formalityLevel:    doc.formalityLevel,
        styleExperimental: doc.styleExperimental,
        occasionType:      doc.occasionType,
      }));

      const response = await fetch(`${FLASK_URL}/refine-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentProfile, interactions }),
      });

      if (!response.ok) return;

      const updatedProfile = await response.json();

      await databases.updateDocument(
        DB_ID, PROFILES_COL, currentProfile.$id!, {
          coord_identity:          updatedProfile.coord_identity,
          coord_risk:              updatedProfile.coord_risk,
          coord_formality:         updatedProfile.coord_formality,
          coord_colorIntensity:    updatedProfile.coord_colorIntensity,
          coord_trendOrientation:  updatedProfile.coord_trendOrientation,
          coord_occasionDiversity: updatedProfile.coord_occasionDiversity,
          profileVersion:          updatedProfile.profileVersion,
          lastRefined:             new Date().toISOString(),
        }
      );
    } catch (err) {
      console.error('Error en refinamiento de perfil:', err);
    }
  },
};