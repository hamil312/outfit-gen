"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { profileController, QuizAnswers } from "@/app/controllers/ProfileController";
import OnboardingQuiz from "@/app/components/ui/OnboardingQuiz";
import BodyTypeCapture from "@/app/components/ui/BodyTypeCapture";

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [quizDone, setQuizDone] = useState(false);
  const [savingBodyType, setSavingBodyType] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);
        const alreadyDone = await profileController.hasCompletedQuiz(user.$id);
        if (alreadyDone) {
          router.replace("/");
          return;
        }
      } catch {
        router.replace("/auth/login");
      } finally {
        setChecking(false);
      }
    };
    init();
  }, []);

  const handleQuizComplete = async (answers: QuizAnswers) => {
    if (!userId) return;
    await profileController.saveQuizProfile(userId, answers);
    setQuizDone(true);
  };

  const handleBodyTypeComplete = async (bodyType: string) => {
    if (!userId) return;
    setSavingBodyType(true);
    try {
      await profileController.saveBodyType(userId, bodyType);
    } catch (err) {
      console.error("Error saving body type:", err);
    } finally {
      setSavingBodyType(false);
    }
    router.push("/");
  };

  const handleSkip = () => {
    router.push("/");
  };

  if (checking) {
    return (
      <div className="quiz-loading">
        <div className="gen-spinner" />
      </div>
    );
  }

  if (quizDone) {
    return (
      <div className="quiz-root">
        <div className="quiz-header">
          <div className="quiz-brand">
            <span className="quiz-brand-name">PickurFit</span>
          </div>
        </div>
        <div className="quiz-card">
          <p className="quiz-question-label">Paso adicional</p>
          <h2 className="quiz-question">¿Quieres detectar tu tipo de cuerpo?</h2>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 20, lineHeight: 1.5 }}>
            Toma una foto o sube una imagen de cuerpo completo para que podamos recomendarte outfits que favorezcan tu silueta.
            Puedes saltar este paso y hacerlo después desde tu perfil.
          </p>
          <BodyTypeCapture
            onComplete={handleBodyTypeComplete}
            onSkip={handleSkip}
            showSkip={true}
          />
          {savingBodyType && (
            <p style={{ textAlign: "center", fontSize: 13, color: "#6366f1", marginTop: 12 }}>
              Guardando…
            </p>
          )}
        </div>
      </div>
    );
  }

  return <OnboardingQuiz onComplete={handleQuizComplete} />;
}
