"use client";

// Se muestra una sola vez después del registro

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { profileController, QuizAnswers } from "@/app/controllers/ProfileController";
import OnboardingQuiz from "@/app/components/ui/OnboardingQuiz";

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const user = await account.get();
        setUserId(user.$id);

        // Si ya completó el quiz, redirigir al home
        const alreadyDone = await profileController.hasCompletedQuiz(user.$id);
        if (alreadyDone) {
          router.replace('/');
          return;
        }
      } catch {
        // No autenticado
        router.replace('/auth/login');
      } finally {
        setChecking(false);
      }
    };
    init();
  }, []);

  const handleQuizComplete = async (answers: QuizAnswers) => {
    if (!userId) return;
    await profileController.saveQuizProfile(userId, answers);
    router.push('/');
  };

  if (checking) {
    return (
      <div className="quiz-loading">
        <div className="gen-spinner" />
      </div>
    );
  }

  return <OnboardingQuiz onComplete={handleQuizComplete} />;
}