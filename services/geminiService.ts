import { GoogleGenAI, Content } from "@google/genai";
import { GenerationRequest, Subject, ChatMessage } from "../types";
import { OFFICIAL_CURRICULUM } from "../curriculum";

// Configuration des tentatives de reconnexion pour réseau instable
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 2000; // 2 secondes

const SYSTEM_INSTRUCTION = `
Identité : Tu es "KARONGO", le rédacteur officiel de fiches pédagogiques pour les enseignants de CM2 au Burkina Faso.

RÈGLE ABSOLUE : Tu dois respecter À LA LETTRE la structure du modèle ci-dessous. Ne change pas les titres des sections. Utilise le format Markdown.

STRUCTURE OBLIGATOIRE DE LA RÉPONSE :

# [TITRE DE LA LEÇON EN MAJUSCULES]

**Discipline** : [Matière]

**Niveau** : CM2

**Durée** : 60 minutes

**Référence** : Programme en vigueur (Édition 2020)

---

### OBJECTIFS D'APPRENTISSAGE
À la fin de la séance, l'apprenant doit être capable de :
* [Verbe d'action] ...
* [Verbe d'action] ...

### MATÉRIEL
* **Collectif** : [Tableau, instruments, objets locaux...]
* **Individuel** : [Ardoise, cahier...]

### DÉROULEMENT DE LA SÉANCE

#### 1. PHASE DE PRÉSENTATION
* **Calcul mental** : [3-4 opérations rapides]
* **Rappel** : [Question rapide sur la leçon précédente]
* **Motivation (Situation problème)** : [Une histoire courte ancrée au Burkina Faso : marché de Koudougou, champ de coton, école de Zagtouli... L'élève doit sentir le besoin d'apprendre la nouvelle notion.]

#### 2. PHASE DE DÉVELOPPEMENT
* **Situation d'apprentissage** : [Activité au tableau ou manipulation]
* **Analyse et Recherche** :
  1. **Manipulation** : [Description de l'action des élèves avec cordes, cailloux, mesures...]
  2. **Observation** : [Ce qu'on remarque]
  3. **Raisonnement** : [Explication logique]
* **Synthèse / Trace Écrite** :
> **[TITRE DE LA RÈGLE]**
>
> 1. **Définition** : ...
> 2. **Règle/Formule** : ...
> *Exemple : ...*

#### 3. ÉVALUATION
* **Exercice de fixation (Ardoise)** : [Exercice simple et immédiat]
* **Correction guidée** : [Réponses attendues]
* **Exercice de transfert / Maison** : [Un problème concret à résoudre avec des valeurs locales (FCFA, kg, km...)]

STYLE & FORMAT :
- Utilise le **Gras** pour les termes clés.
- Pour l'en-tête (Discipline, Niveau...), laisse bien une ligne vide entre chaque élément pour qu'ils s'affichent les uns sous les autres.
- Utilise LaTeX pour les maths (ex: $P = c \\times 4$).
- Reste concis et professionnel.

**BASE DE CONNAISSANCES OFFICIELLE :**
${OFFICIAL_CURRICULUM}
`;

const CHAT_SYSTEM_INSTRUCTION = `
Tu es KARONGO, l'assistant des enseignants.
Ton rôle est STRICTEMENT limité à répondre aux questions concernant la leçon en cours.

**RÈGLE D'OR :**
Si la question de l'utilisateur n'a AUCUN rapport avec la leçon, la pédagogie, ou le contexte scolaire du Burkina Faso, tu dois DECLINER poliment la réponse.

Utilise le contexte officiel suivant et le contenu de la leçon actuelle pour répondre.
Sois concis, précis et pédagogique.

CONTEXTE OFFICIEL :
${OFFICIAL_CURRICULUM}
`;

const MODIFICATION_SYSTEM_INSTRUCTION = `
Tu es un éditeur expert de contenu pédagogique.
On te fournit une leçon existante et une instruction de modification.
Ta tâche est de réécrire la leçon pour intégrer la modification demandée de la manière la plus naturelle possible.

RÈGLES DE RÉDACTION (CRITIQUE) :
1. **Langage Humain** : Le texte doit être fluide et lisible comme dans un manuel scolaire. Évite le jargon technique ou la syntaxe de code.
2. **Pas de HTML** : N'utilise JAMAIS de balises HTML (comme <div>, <span>, etc). Cela rend le texte illisible pour l'enseignant.
3. **Formatage** :
   - Utilise le Markdown standard uniquement (**Gras**, *Italique*, Listes).
   - Pour les maths, utilise la syntaxe LaTeX simple entre dollars (ex: $2 + 2 = 4$).
   - Respecte les sauts de ligne pour l'en-tête (Discipline, Niveau, Durée, Référence).
4. **Intégrité** : Conserve la structure originale (Titres, Sections) sauf si on te demande explicitement de la changer.

TA MISSION :
Renvoie TOUTE la leçon mise à jour, propre et prête à être utilisée en classe.

CONTEXTE OFFICIEL :
${OFFICIAL_CURRICULUM}
`;

/**
 * Utilitaire pour gérer les tentatives de reconnexion (Exponential Backoff)
 * Crucial pour les zones à faible couverture internet.
 */
async function withRetry<T>(operation: () => Promise<T>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY): Promise<T> {
  try {
    return await operation();
  } catch (error: any) {
    if (retries <= 0) throw error;
    
    // Ne pas réessayer si c'est une erreur client (ex: API Key invalide)
    if (error.message && (error.message.includes("API key") || error.message.includes("INVALID_ARGUMENT"))) {
        throw error;
    }

    console.warn(`Connexion instable, nouvelle tentative dans ${delay}ms... (${retries} restantes)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(operation, retries - 1, delay * 2);
  }
}

export const generateLesson = async (request: GenerationRequest): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("Clé API manquante.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Construction du prompt utilisateur
  let promptContext = `
  Sujet : ${request.topic}
  Matière : ${request.subject}
  Niveau : CM2 (Burkina Faso)
  Difficulté : ${request.difficulty}
  Contexte enseignant : ${request.additionalContext || "Aucun"}
  `;

  if (request.force) {
      promptContext += "\nNOTE: Ignore les incohérences de matière et génère la leçon quand même.";
  }

  const operation = async () => {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: promptContext,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });
    return response.text || "Erreur de génération.";
  };

  try {
    const text = await withRetry(operation);

    // Gestion des signaux de contrôle de l'IA
    if (text.trim() === "INVALID_INPUT") {
        throw new Error("Sujet invalide ou incompréhensible. Veuillez entrer un sujet de leçon réel.");
    }
    
    if (text.startsWith("MISMATCH:") && !request.force) {
        return text;
    }

    return text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message.includes("Sujet invalide")) {
        throw error;
    }
    throw new Error("La connexion au réseau est trop faible. Veuillez vérifier votre accès internet.");
  }
};

export const modifyLesson = async (currentContent: string, instruction: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("Clé API manquante.");

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    CONTENU ACTUEL :
    ${currentContent}

    INSTRUCTION DE MODIFICATION :
    ${instruction}
    `;

    const operation = async () => {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                systemInstruction: MODIFICATION_SYSTEM_INSTRUCTION,
                temperature: 0.1,
            }
        });
        return response.text || currentContent;
    };

    try {
        return await withRetry(operation);
    } catch (error) {
        console.error("Modification Error:", error);
        throw new Error("Impossible de modifier la leçon (Erreur réseau).");
    }
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string, lessonContext: string): Promise<string> => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("Clé API manquante.");
    }
  
    const ai = new GoogleGenAI({ apiKey });
  
    const sdkHistory: Content[] = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    const contextInstruction = `${CHAT_SYSTEM_INSTRUCTION}\n\nCONTENU DE LA LEÇON ACTUELLE (Le contexte de référence) :\n${lessonContext}`;

    const operation = async () => {
        const chat = ai.chats.create({
            model: "gemini-3-pro-preview",
            config: {
                systemInstruction: contextInstruction,
            },
            history: sdkHistory
        });

        const response = await chat.sendMessage({ message: newMessage });
        return response.text || "Je n'ai pas pu générer de réponse.";
    };

    try {
        return await withRetry(operation);
    } catch (error) {
        console.error("Chat Error:", error);
        throw new Error("Erreur de connexion avec Karongo. Vérifiez votre réseau.");
    }
};