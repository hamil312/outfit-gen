## Secuencia — OutfitGen

```eraser
// ═══════════════════════════════════════════════════════════════════════════════
// INICIO DE SESIÓN
// ═══════════════════════════════════════════════════════════════════════════════

Usuario [icon: user] > Browser [icon: monitor]: Ingresa credenciales (email + contraseña)
Browser > Appwrite [icon: database]: account.createEmailSession()
Appwrite --> Browser: Sesión iniciada (token)
Browser --> Usuario: Redirige al dashboard

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRO Y ONBOARDING
// ═══════════════════════════════════════════════════════════════════════════════

Usuario > Browser: Crea cuenta (email + contraseña)
Browser > Appwrite: account.create() + account.createEmailSession()
Browser > Appwrite: databases.createDocument (createDefaultProfile)
note right: Perfil neutro — todas las coords en 0.5
Appwrite --> Browser: Perfil creado
Browser --> Usuario: Redirige al onboarding

Usuario > Browser: Responde quiz de 7 pasos
Browser > Browser: quizToProfile(answers) → 6 coordenadas [0,1]
Browser > Appwrite: databases.updateDocument (saveQuizProfile)
note right: coord_identity, coord_risk, coord_formality,\ncoord_colorIntensity, coord_trendOrientation,\ncoord_occasionDiversity
Appwrite --> Browser: Perfil actualizado
Browser --> Usuario: Muestra paso de tipo de cuerpo

// ── Body type detection via ONNX model ──

Usuario [icon: user] > Browser: Sube foto de cuerpo completo
Browser > Flask [icon: server]: POST /classify-body-type (imagen)
Flask > ONNX [icon: cpu]: model.predict(image_bytes)
ONNX --> Flask: ectomorfo / endomorfo / mesomorfo + confianza
Flask --> Browser: Resultado de clasificación
Browser > Appwrite: databases.updateDocument (saveBodyType)
Appwrite --> Browser: BodyType guardado
Browser --> Usuario: Redirige al home

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRO DE PRENDA (con validación por FashionCLIP)
// ═══════════════════════════════════════════════════════════════════════════════

Usuario > Browser: Selecciona imagen + datos
Browser > Browser: Compresión a WebP (compressToWebP)
Browser > Flask: POST /analyze (imagen comprimida)
Flask > FashionCLIP [icon: cpu]: CLIPProcessor + CLIPModel (classify)
FashionCLIP --> Flask: type, color_name, material, print, style, occasion
note right: Validación y extracción de atributos\nmediante FashionCLIP embedding
Flask --> Browser: Resultado del análisis
Browser > Appwrite: storage.createFile (subir WebP)
Appwrite --> Browser: image ID
Browser > Appwrite: databases.createDocument (guardar metadatos)
Appwrite --> Browser: Prenda creada
Browser --> Usuario: Confirmación + previsualización

// ═══════════════════════════════════════════════════════════════════════════════
// GENERACIÓN DE ATUENDO POR PARÁMETROS
// ═══════════════════════════════════════════════════════════════════════════════

Usuario > Browser: Selecciona filtros (color, contexto, estilo, material, estampado)
Usuario > Browser: Clic en "Generar"
Browser > Browser: Filtra prendas según color/contexto/estilo

// ── Con prenda base ──
Browser > Flask: POST /generate-outfit-with-base (prenda base + items + toggles)
Flask > Flask: pick_by_occasion / pick_basic / pick_with_constraints
note right: Validación de compatibilidad:\nreglas de color, material,\nestampado y ocasión
Flask --> Browser: Outfit completo
Browser --> Usuario: Muestra outfit

// ── Sin filtros específicos ──
Browser > Flask: POST /generate-outfits (items filtrados + parámetros)
Flask > Flask: _match_outfits (color + occasion + material + print)
Flask --> Browser: Combinaciones de outfits
Browser --> Usuario: Muestra resultados

// ═══════════════════════════════════════════════════════════════════════════════
// GENERACIÓN POR PRENDA SELECCIONADA
// ═══════════════════════════════════════════════════════════════════════════════

Usuario > Browser: Clic en "Seleccionar prenda"
Browser --> Usuario: Modal con guardarropa
Usuario > Browser: Elige una prenda (con toggles modales)
Browser > Flask: POST /generate-outfit-with-base (prenda elegida + items + toggles)
Flask > Flask: _by_occasion() + pick() (color + material + print)
Flask --> Browser: Outfit generado
Browser --> Usuario: Muestra resultado

// ═══════════════════════════════════════════════════════════════════════════════
// REFINAMIENTO DE PERFIL POR INTERACCIONES
// ═══════════════════════════════════════════════════════════════════════════════

Usuario > Browser: Reacciona a un outfit (guardar, descartar, gustar, regenerar, publicar)
Browser > Browser: Extrae features (colorIntensity, formalityLevel, styleExperimental, occasionType)
Browser > Appwrite: databases.createDocument (recordInteraction)
Appwrite --> Browser: Interacción registrada
Browser > Appwrite: databases.updateDocument (incrementa interactionsCount)
Appwrite --> Browser: interactionsCount + 1

// ── Cada 5 interacciones ──
Browser > Appwrite: databases.listDocuments (últimas 20 interacciones)
Appwrite --> Browser: Interactions list
Browser > Flask: POST /refine-profile (currentProfile + interactions)
Flask > ProfileRefiner [icon: cpu]: refine_profile()
note right: Bayesian update con learning rate\ndecreciente: alpha = 1/(1+0.1*n)
ProfileRefiner --> Flask: Coordenadas actualizadas
Flask --> Browser: Perfil refinado
Browser > Appwrite: databases.updateDocument (guarda nuevas coordenadas)
Appwrite --> Browser: Perfil actualizado
Browser --> Usuario: Recomendaciones más precisas
```
