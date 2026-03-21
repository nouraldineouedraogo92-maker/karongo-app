
export const getCurriculum = (gradeLevel: 'CM1' | 'CM2') => `
CONTEXTE PÉDAGOGIQUE OFFICIEL (BURKINA FASO - ${gradeLevel} - ÉDITION 2020) :

STRUCTURE D'UNE FICHE PÉDAGOGIQUE OFFICIELLE :
1.  **Titre & Thème** : Doit correspondre exactement aux programmes.
2.  **Objectifs d'apprentissage** : Ce que l'apprenant doit être capable de faire (verbes d'action).
3.  **Matériel/Supports** : Collectif (tableau, instruments de mesure, objets locaux comme cailloux, bidons, plantes, os) et Individuel (ardoise, craie).
4.  **Déroulement de la séance** :
    *   *Phase de Présentation* : Calcul mental, Rappel des prérequis, Motivation (situation problème ancrée dans le quotidien burkinabè, ex: un élève blessé au sport, un jardinier au champ).
    *   *Phase de Développement* : 
        *   Présentation de la situation d'apprentissage.
        *   Analyse/Échanges/Production : Les élèves travaillent en groupe, manipulent, cherchent.
        *   Synthèse : La règle ou la formule à retenir (Trace écrite).
    *   *Phase d'Évaluation* : Vérification des acquis (Oral et Écrit) et Activités de prolongement.

CONTENUS SPÉCIFIQUES EXTRAITS DES ANNALES ET FICHES :

${gradeLevel === 'CM1' ? `**LECTURE :**
*   *Lecture silencieuse* : Compréhension générale du texte, repérage d'informations.
*   *Lecture à haute voix* : Fluidité, respect de la ponctuation, intonation, articulation.
*   *Exploitation de texte* : Explication de mots difficiles, questions de compréhension, dégager l'idée générale.
` : ''}
**ARITHMÉTIQUE :**
*   *Nombres* : Classes de mille, millions, milliards.
*   *Opérations* : Multiplication (zéro intercalaire), Division (cas particuliers, nombres décimaux), Preuve par 9.
*   *Fractions* : Fractions équivalentes, prendre la fraction d'un nombre, opérations sur les fractions.
*   *Proportionnalité* : Règle de trois (retour à l'unité), Pourcentages (calcul, remise, majoration, TVA), Épargne (Intérêt, Capital, Taux, Durée), Partages inégaux, Vitesse moyenne, Échelles.

**GÉOMÉTRIE :**
*   *Lignes & Angles* : Droites perpendiculaires, parallèles, angles.
*   *Polygones* : Carré, Rectangle, Triangle (hauteur, base), Parallélogramme, Losange, Trapèze.
*   *Cercle* : Rayon, Diamètre, Circonférence (Pi = 3,14).
*   *Solides* : Cube (développement, arêtes, faces), Pavé droit, Cylindre.
*   *Calculs* : Périmètres, Aires (Surface), Surfaces augmentées/diminuées.

**SYSTÈME MÉTRIQUE :**
*   *Longueurs* : Mètre et ses multiples/sous-multiples.
*   *Capacités* : Litre (conversions).
*   *Masses* : Gramme (Poids net, Poids brut, Tare).
*   *Aires* : m² et mesures agraires (are, hectare, centiare).
*   *Volumes* : m³, dm³, cm³. Correspondance Volume/Capacité/Masse (1dm³ = 1L = 1kg d'eau).
*   *Temps* : Conversions heures/minutes/secondes, opérations sur les nombres complexes (temps).

**SCIENCES DE LA VIE ET DE LA TERRE (SVT) :**

*   **LE CORPS HUMAIN ET SANTÉ :**
    *   *Le Squelette* : Os longs (fémur, humérus, tibia), courts (vertèbres, phalanges), plats (omoplate, crâne). Coupe d'un os long (cartilage, os spongieux, périoste, os compact, moelle jaune). Rôle de soutien.
    *   *Muscles & Articulations* : Muscles rouges/blancs, biceps/triceps (antagonistes). Articulations (coude, genou, épaule). Accidents : foulure, entorse, luxation (déboîtement), fracture.
    *   *Dents* : Incisives (couper), Canines (déchirer), Molaires (broyer). 32 dents chez l'adulte. Structure : émail, ivoire, pulpe. Carie dentaire.
    *   *Digestion* : Trajet (bouche -> œsophage -> estomac -> intestin grêle -> gros intestin). Glandes (salivaires, gastriques, pancréas, foie). Hygiène alimentaire (bien cuire, laver).
    *   *Respiration* : Inspiration (entrée d'oxygène), Expiration (sortie gaz carbonique). Organes : trachée, bronches, poumons. Asphyxie et secourisme (méthode de Schaeffer, bouche-à-bouche).
    *   *Circulation* : Cœur (oreillettes, ventricules), Artères (sang rouge/riche), Veines (sang noir/pauvre), Capillaires. Petite et grande circulation. Hémorragies (artérielle, veineuse, capillaire) et garrot.
    *   *Appareil Urinaire* : Reins (filtres), uretères, vessie, urètre. Hygiène : boire de l'eau, éviter l'alcool.
    *   *Système Nerveux* : Cerveau, cervelet, bulbe rachidien, moelle épinière, nerfs (sensitifs/moteurs). Actes volontaires vs réflexes. Dangers : alcool, tabac, manque de sommeil.
    *   *Reproduction/Santé* : Puberté, cycle menstruel, fécondation. Grossesse (suivi prénatal). Allaitement (maternel exclusif conseillé 6 mois, sevrage). Vaccination (BCG, Polio, Rougeole, Fièvre jaune).

*   **MALADIES :**
    *   *Paludisme* : Moustique anophèle. Prévention : moustiquaire imprégnée, assainissement.
    *   *Maladies hydriques* : Choléra, Typhoïde, Dysenterie. Causes : eau souillée, manque d'hygiène.
    *   *Autres* : Tuberculose (BCG), Méningite (cou raide, ponction lombaire), Tétanos, Rougeole.
    *   *IST/VIH/SIDA* : Modes de transmission (sang, sexuel, mère-enfant). Prévention : Abstinence, Fidélité, Condom.

*   **BOTANIQUE ET AGRICULTURE :**
    *   *Nutrition* : Assimilation chlorophyllienne (besoin de lumière, eau, gaz carbonique). Sève brute vs sève élaborée.
    *   *Reproduction* : Par graines (semis) ou végétative (bouturage, marcottage, greffage).
    *   *Techniques culturales* : Défrichage, labour, semis (en ligne/à la volée), sarclage, binage, buttage. Engrais (organiques/chimiques). Assolement.
    *   *Plantes spécifiques* :
        *   Industrielles/Textiles : Coton (capsule, fibre), Canne à sucre.
        *   Oléagineuses : Arachide, Sésame.
        *   Vivrières : Maïs, Mil, Sorgho, Haricot (légumineuse), Igname/Manioc (tubercules).
        *   Arbres utilitaires : Néré, Karité, Baobab, Neem (pharmacie traditionnelle), Eucalyptus.

*   **PHYSIQUE / TECHNOLOGIE (Matière) :**
    *   *États de la matière* : Solide (forme propre), Liquide (forme du récipient, horizontalité), Gaz (expansible, compressible).
    *   *L'Air* : Mélange de gaz (Azote, Oxygène, Gaz rares). Indispensable à la vie et aux combustions.
    *   *L'Eau* : Cycle de l'eau (évaporation -> condensation -> pluie/ruissellement -> infiltration). Changements d'états.
    *   *Combustions* : Vive (feu, lumière, chaleur), Lente (rouille, respiration). Combustibles solides (bois), liquides (pétrole), gazeux (butane).
    *   *Outils* : Le thermomètre (mercure/alcool, degrés Celsius), la poulie, le levier.

*   **ÉDUCATION ENVIRONNEMENTALE :**
    *   Gestion des déchets (plastiques), reboisement, feux de brousse, protection des sols.

PRINCIPES DIDACTIQUES :
*   Privilégier la méthode participative et les travaux de groupes.
*   Utiliser des exemples locaux : Marchés, champs de coton, élevage de volaille, artisanat, distances entre villes du Burkina (ex: Ouaga-Bobo), monnaie (FCFA).
*   La leçon ne doit pas être superficielle. Elle doit expliquer le *pourquoi* et le *comment* avant de donner la règle.
`;
