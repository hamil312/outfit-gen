// src/app/models/UserProfile.ts

export interface UserProfile {
  $id?: string;
  userId: string;

  // Coordenadas del perfil (0.0 - 1.0)
  coord_identity: number;          // 0=funcional → 1=expresivo
  coord_risk: number;              // 0=conservador → 1=experimental
  coord_formality: number;         // 0=casual → 1=formal
  coord_colorIntensity: number;    // 0=neutros → 1=colores vivos
  coord_trendOrientation: number;  // 0=estilo propio → 1=tendencias
  coord_occasionDiversity: number; // 0=contexto único → 1=múltiples contextos

  // Metadatos
  profileVersion: number;
  interactionsCount: number;
  quizCompleted: boolean;
  lastRefined?: string;
  styleKeyword?: string;
  dominantOccasion?: string;
}

export interface UserInteraction {
  $id?: string;
  userId: string;
  outfitId: string;
  action: 'saved' | 'discarded' | 'regenerated' | 'liked' | 'published';
  colorIntensity: number;
  formalityLevel: number;
  styleExperimental: number;
  occasionType?: string;
  timestamp: string;
}

// Valores por defecto cuando no hay quiz completado
export const defaultProfile = (userId: string): Omit<UserProfile, '$id'> => ({
  userId,
  coord_identity:          0.5,
  coord_risk:              0.5,
  coord_formality:         0.5,
  coord_colorIntensity:    0.5,
  coord_trendOrientation:  0.5,
  coord_occasionDiversity: 0.5,
  profileVersion:          1,
  interactionsCount:       0,
  quizCompleted:           false,
});