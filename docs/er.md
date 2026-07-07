## ERD — OutfitGen

```erd
// ─── Entidades del sistema ──────────────────────────────────────────────────

User [icon: user, color: blue] {
  id string pk
  name string
  email string
}

Clothing [icon: shirt, color: green] {
  id string pk
  userID string
  imageID string
  type string
  color_name string
  material string
  print string
  style string
  occasion string
  colour_hex string
  usageCount number
  created_at string
}

Outfit [icon: layout, color: purple] {
  id string pk
  userID string
  name string
  clothes string[]
  occasion string
  colour_hex string
  context string
  image string
  published boolean
  totalScore number
  userName string
  created_at string
}

Favourite [icon: heart, color: red] {
  id string pk
  userID string
  outfitID string
}

Comment [icon: message-circle, color: gray] {
  id string pk
  userID string
  outfitID string
  comment string
  created_at string
}

// ─── Nuevas entidades de perfil e interacciones ─────────────────────────────

UserProfile [icon: user-check, color: teal] {
  id string pk
  userID string
  coord_identity number
  coord_risk number
  coord_formality number
  coord_colorIntensity number
  coord_trendOrientation number
  coord_occasionDiversity number
  profileVersion number
  interactionsCount number
  quizCompleted boolean
  lastRefined string
  styleKeyword string
  dominantOccasion string
  skinTone string
  bodyType string
}

UserInteraction [icon: activity, color: orange] {
  id string pk
  userID string
  outfitID string
  action string
  colorIntensity number
  formalityLevel number
  styleExperimental number
  occasionType string
  timestamp string
}

// ─── Relaciones ──────────────────────────────────────────────────────────────

Clothing.userID > User.id
Outfit.userID > User.id
Favourite.userID > User.id
Favourite.outfitID > Outfit.id
Comment.userID > User.id
Comment.outfitID > Outfit.id
UserProfile.userID > User.id
UserInteraction.userID > User.id
UserInteraction.outfitID > Outfit.id
```

### Notas

| Entidad | Detalles de campos |
|---|---|
| **Clothing** | `type` ∈ {upper, lower, footwear, accesory, dress, set, top} — `color_name` ∈ {blanco, negro, gris, beige, azul, rojo, verde, ...} — `material` ∈ {denim, cotton, leather, silk, polyester, wool, ...} — `print` ∈ {solid, striped, plaid, floral, graphic, animal} — `style` ∈ {casual, formal, sporty, elegant, boho, preppy, vintage} — `occasion` ∈ {casual, sport, formal, party, office, informal, beach, date} |
| **Outfit** | `clothes[]` = IDs de Clothing; `published` → visible en galería pública |
| **UserProfile** | `coord_*` ∈ [0.0, 1.0]; `profileVersion` se incrementa en cada refinamiento; `skinTone` → categoría Fitzpatrick; `bodyType` ∈ {ectomorfo, endomorfo, mesomorfo} |
| **UserInteraction** | `action` ∈ {saved, discarded, regenerated, liked, published} — Se usa para refinar coordenadas del perfil cada 5 interacciones |
