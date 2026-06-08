'use client';
import React, { useState, useEffect, useRef } from 'react';
import { BsChatDotsFill, BsX, BsSend } from 'react-icons/bs';
import { FaRobot } from 'react-icons/fa';
import { Clothing } from '@/app/models/Clothing';
import { UserProfile } from '@/app/models/UserProfile';
import { profileController } from '@/app/controllers/ProfileController';
import { useAuth } from '@/app/context/AuthContext';
import styles from './WardrobeChatbot.module.css';

const FLASK_URL = process.env.NEXT_PUBLIC_FLASK_URL || 'http://localhost:5000';

const QUICK_QUESTIONS = [
  '¿Cuál es mi estilo?',
  '¿Qué me falta comprar?',
  '¿Por qué me recomiendas colores neutros?',
  '¿Cómo de variado es mi armario?',
  '¿Qué ocasiones cubro bien?',
  '¿Soy conservador o experimental?',
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface WardrobeChatbotProps {
  clothes: Clothing[];
  outfits: any[];
}

export default function WardrobeChatbot({ clothes, outfits }: WardrobeChatbotProps) {
  const { user } = useAuth();
  const [open, setOpen]                   = useState(false);
  const [messages, setMessages]           = useState<Message[]>([]);
  const [input, setInput]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [profile, setProfile]             = useState<UserProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !profileLoaded && user?.$id) {
      profileController.getProfile(user.$id)
        .then(p => { setProfile(p); setProfileLoaded(true); })
        .catch(() => setProfileLoaded(true));
    }
  }, [open, profileLoaded, user]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: '¡Hola! Soy Piksy, tu asistente de moda. Puedo ayudarte a entender tu estilo, analizar tu armario y darte recomendaciones personalizadas. ¿En qué te puedo ayudar hoy?',
      }]);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const buildContext = () => ({
    profile: profile ? {
      coord_identity:          profile.coord_identity,
      coord_risk:              profile.coord_risk,
      coord_formality:         profile.coord_formality,
      coord_colorIntensity:    profile.coord_colorIntensity,
      coord_trendOrientation:  profile.coord_trendOrientation,
      coord_occasionDiversity: profile.coord_occasionDiversity,
      interactionsCount:       profile.interactionsCount,
    } : {},
    wardrobe: clothes.map(c => ({
      type:     c.type,
      color:    c.color,
      style:    c.style,
      occasion: c.occasion,
      material: c.material,
    })),
    outfits: outfits.map(o => ({ occasion: (o as any).occasion })),
  });

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${FLASK_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          context: buildContext(),
          history: messages.slice(-10),
        }),
      });
      const data = await res.json();
      const reply = res.ok
        ? (data.response || 'Sin respuesta del modelo.')
        : (data.error   || 'Error al conectar con el asistente.');
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'No pude conectarme. Verifica que el servidor Flask esté corriendo.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const showChips = messages.length <= 1 && !loading;

  return (
    <>
      <button
        className={`${styles.fab}${open ? ` ${styles.fabOpen}` : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente de moda'}
      >
        {open ? <BsX size={26} /> : <BsChatDotsFill size={22} />}
      </button>

      <div
        className={`${styles.panel}${open ? ` ${styles.panelOpen}` : ''}`}
        role="dialog"
        aria-label="Piksy — Asistente de Moda"
      >
        <div className={styles.header}>
          <FaRobot size={17} className={styles.headerIcon} />
          <span className={styles.headerTitle}>Piksy — Asistente de Moda</span>
          <button className={styles.headerClose} onClick={() => setOpen(false)} aria-label="Cerrar">
            <BsX size={20} />
          </button>
        </div>

        <div className={styles.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant}`}
            >
              <p className={styles.bubbleText}>{msg.content}</p>
            </div>
          ))}
          {loading && (
            <div className={`${styles.bubble} ${styles.bubbleAssistant}`}>
              <span className={styles.typing}>
                <span /><span /><span />
              </span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {showChips && (
          <div className={styles.chips}>
            {QUICK_QUESTIONS.map(q => (
              <button key={q} className={styles.chip} onClick={() => sendMessage(q)}>
                {q}
              </button>
            ))}
          </div>
        )}

        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregúntame sobre tu estilo..."
            disabled={loading}
          />
          <button
            className={styles.sendBtn}
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            aria-label="Enviar mensaje"
          >
            <BsSend size={15} />
          </button>
        </div>
      </div>
    </>
  );
}
