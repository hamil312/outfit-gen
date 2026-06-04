"use client";

import React, { useState } from "react";
import { QuizAnswers } from "@/app/controllers/ProfileController";
import { BsStars } from "react-icons/bs";

interface OnboardingQuizProps {
  onComplete: (answers: QuizAnswers) => Promise<void>;
}

// ─── Question definitions ─────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 'motivation',
    step: 1,
    question: '¿Qué es lo más importante para ti cuando eliges un outfit?',
    type: 'single',
    options: [
      { value: 'express',  label: 'Expresar mi personalidad',       emoji: '🎨' },
      { value: 'comfort',  label: 'Sentirme cómodo/a',              emoji: '😌' },
      { value: 'social',   label: 'Encajar con el contexto',        emoji: '🤝' },
      { value: 'impress',  label: 'Causar buena impresión',         emoji: '✨' },
    ],
  },
  {
    id: 'newClothing',
    step: 2,
    question: 'Ves una prenda diferente a todo lo que usas. ¿Qué haces?',
    type: 'single',
    options: [
      { value: 'buy_it',   label: 'La compro, me encanta probar',   emoji: '🛍️' },
      { value: 'consider', label: 'La considero, pero lo pienso',   emoji: '🤔' },
      { value: 'pass',     label: 'Paso, prefiero lo que ya conozco', emoji: '👋' },
    ],
  },
  {
    id: 'palette',
    step: 3,
    question: '¿Cómo son los colores de tu guardarropa actual?',
    type: 'single',
    options: [
      { value: 'neutrals', label: 'Mayormente neutros (negro, blanco, gris)', emoji: '🖤' },
      { value: 'earth',    label: 'Tonos tierra (beige, marrón, verde oliva)', emoji: '🌿' },
      { value: 'mixed',    label: 'Mix equilibrado',                emoji: '🎭' },
      { value: 'vivid',    label: 'Colores vivos y llamativos',     emoji: '🌈' },
    ],
  },
  {
    id: 'styleWord',
    step: 4,
    question: '¿Cuál de estas palabras describe mejor cómo quieres verte?',
    type: 'single',
    options: [
      { value: 'minimal',      label: 'Minimalista — menos es más',      emoji: '⬜' },
      { value: 'classic',      label: 'Clásico — atemporal y elegante',  emoji: '👔' },
      { value: 'urban',        label: 'Urbano — moderno y callejero',    emoji: '🏙️' },
      { value: 'experimental', label: 'Experimental — arriesgado y único', emoji: '🔥' },
    ],
  },
  {
    id: 'occasion',
    step: 5,
    question: '¿En qué contexto usas ropa con más frecuencia?',
    type: 'single',
    options: [
      { value: 'work',   label: 'Trabajo o universidad',  emoji: '💼' },
      { value: 'social', label: 'Salidas y reuniones',    emoji: '🥂' },
      { value: 'sport',  label: 'Deporte y actividades',  emoji: '🏃' },
      { value: 'home',   label: 'Casa y día a día',       emoji: '🏠' },
    ],
  },
  {
    id: 'trendScale',
    step: 6,
    question: '¿Qué tan importante es para ti estar a la moda?',
    type: 'scale',
    scaleLabels: { min: 'Nada importante', max: 'Muy importante' },
  },
  {
    id: 'contexts',
    step: 7,
    question: '¿En qué ocasiones necesitas outfits? Selecciona todas las que apliquen.',
    type: 'multi',
    options: [
      { value: 'work',     label: 'Trabajo',        emoji: '💼' },
      { value: 'casual',   label: 'Casual',          emoji: '👟' },
      { value: 'formal',   label: 'Formal',          emoji: '🎩' },
      { value: 'sport',    label: 'Deporte',         emoji: '⚽' },
      { value: 'party',    label: 'Fiestas',         emoji: '🎉' },
      { value: 'date',     label: 'Citas',           emoji: '💫' },
      { value: 'beach',    label: 'Playa',           emoji: '🏖️' },
      { value: 'travel',   label: 'Viajes',          emoji: '✈️' },
    ],
  },
] as const;

const TOTAL_STEPS = QUESTIONS.length;

export default function OnboardingQuiz({ onComplete }: OnboardingQuizProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({
    trendScale: 3,
    contexts: [],
  });

  const current = QUESTIONS[step];
  const progress = ((step) / TOTAL_STEPS) * 100;
  const isLast = step === TOTAL_STEPS - 1;

  const canAdvance = (): boolean => {
    const q = current;
    if (q.type === 'single') return !!answers[q.id as keyof QuizAnswers];
    if (q.type === 'scale')  return typeof answers.trendScale === 'number';
    if (q.type === 'multi')  return (answers.contexts?.length ?? 0) > 0;
    return false;
  };

  const handleSingle = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleScale = (value: number) => {
    setAnswers(prev => ({ ...prev, trendScale: value as QuizAnswers['trendScale'] }));
  };

  const handleMulti = (value: string) => {
    setAnswers(prev => {
      const current = prev.contexts ?? [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, contexts: updated };
    });
  };

  const handleNext = () => {
    if (canAdvance() && step < TOTAL_STEPS - 1) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!canAdvance()) return;
    setSubmitting(true);
    try {
      await onComplete(answers as QuizAnswers);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="quiz-root">

      {/* Header */}
      <div className="quiz-header">
        <div className="quiz-brand">
          <BsStars size={18} className="quiz-brand-icon" />
          <span className="quiz-brand-name">PickurFit</span>
        </div>
        <span className="quiz-step-count">{step + 1} / {TOTAL_STEPS}</span>
      </div>

      {/* Progress bar */}
      <div className="quiz-progress-track">
        <div
          className="quiz-progress-fill"
          style={{ width: `${progress + (1 / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      {/* Question card */}
      <div className="quiz-card">
        <p className="quiz-question-label">Pregunta {step + 1}</p>
        <h2 className="quiz-question">{current.question}</h2>

        {/* Single select */}
        {current.type === 'single' && (
          <div className="quiz-options">
            {(current as any).options.map((opt: any) => (
              <button
                key={opt.value}
                className={`quiz-option ${
                  answers[current.id as keyof QuizAnswers] === opt.value
                    ? 'quiz-option--selected'
                    : ''
                }`}
                onClick={() => handleSingle(current.id, opt.value)}
              >
                <span className="quiz-option-emoji">{opt.emoji}</span>
                <span className="quiz-option-label">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Scale */}
        {current.type === 'scale' && (
          <div className="quiz-scale-wrap">
            <div className="quiz-scale-row">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  className={`quiz-scale-btn ${answers.trendScale === n ? 'quiz-scale-btn--selected' : ''}`}
                  onClick={() => handleScale(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="quiz-scale-labels">
              <span>{(current as any).scaleLabels.min}</span>
              <span>{(current as any).scaleLabels.max}</span>
            </div>
          </div>
        )}

        {/* Multi select */}
        {current.type === 'multi' && (
          <div className="quiz-options quiz-options--grid">
            {(current as any).options.map((opt: any) => (
              <button
                key={opt.value}
                className={`quiz-option ${
                  answers.contexts?.includes(opt.value)
                    ? 'quiz-option--selected'
                    : ''
                }`}
                onClick={() => handleMulti(opt.value)}
              >
                <span className="quiz-option-emoji">{opt.emoji}</span>
                <span className="quiz-option-label">{opt.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="quiz-nav">
        {step > 0 && (
          <button className="quiz-back-btn" onClick={handleBack}>
            ← Anterior
          </button>
        )}

        {!isLast ? (
          <button
            className={`quiz-next-btn ${!canAdvance() ? 'quiz-next-btn--disabled' : ''}`}
            onClick={handleNext}
            disabled={!canAdvance()}
          >
            Siguiente →
          </button>
        ) : (
          <button
            className={`quiz-submit-btn ${(!canAdvance() || submitting) ? 'quiz-submit-btn--disabled' : ''}`}
            onClick={handleSubmit}
            disabled={!canAdvance() || submitting}
          >
            <BsStars size={15} className="quiz-submit-icon" />
            {submitting ? 'Guardando perfil…' : 'Comenzar a generar outfits'}
          </button>
        )}
      </div>

    </div>
  );
}