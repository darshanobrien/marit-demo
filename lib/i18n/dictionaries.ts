import type {
  BusinessArea,
  BusinessCasePriority,
  BusinessCaseStatus,
  DataSensitivityLevel,
  EvaluationRiskLevel,
  ExpectedBenefit,
  IntakeDataSensitivity,
  IntakeUrgency,
} from "../domain/types";
import type { DashboardPriority, DashboardSort } from "../dashboard/businessCaseDashboard";
import type { IntakeField, IntakeValidationCode } from "../intake/businessCaseIntake";

export const locales = ["en-CA", "fr-CA"] as const;

export type Locale = (typeof locales)[number];
export type Role = "businessUser" | "aiBuilder" | "admin";
export type PageKey = "home" | "dashboard" | "submit" | "assessments" | "adminTools";
export type ShellPageKey = Exclude<PageKey, "home">;

export type Dictionary = {
  app: {
    name: string;
    tagline: string;
    skipToContent: string;
    demoNotice: string;
  };
  controls: {
    roleLabel: string;
    localeLabel: string;
  };
  roles: Record<Role, string>;
  locales: Record<Locale, string>;
  nav: Record<PageKey, string>;
  landing: {
    eyebrow: string;
    title: string;
    valueProposition: string;
    primaryCta: string;
    secondaryCta: string;
    heroImageAlt: string;
    whatTitle: string;
    whatBody: string;
    whyTitle: string;
    whyBody: string[];
    howTitle: string;
    howSteps: string[];
    whoTitle: string;
    businessTeamsTitle: string;
    businessTeamsItems: string[];
    aiBuildersTitle: string;
    aiBuildersItems: string[];
  };
  pages: Record<
    ShellPageKey,
    {
      title: string;
      description: string;
      cardTitle: string;
      cardBody: string;
      primaryAction: string;
      secondaryAction: string;
    }
  >;
  badges: {
    mockData: string;
    shellOnly: string;
    rolePrefix: string;
  };
  dashboard: {
    summaryTitle: string;
    listTitle: string;
    tableCaption: string;
    roleIntro: Record<Role, string>;
    metrics: {
      totalRequests: string;
      readyForReview: string;
      highUrgency: string;
      strongFit: string;
      highestPriority: string;
      noHighestPriority: string;
    };
    filters: {
      title: string;
      status: string;
      businessArea: string;
      urgency: string;
      sort: string;
      allStatuses: string;
      allAreas: string;
      allUrgencies: string;
    };
    sortOptions: Record<DashboardSort, string>;
    columns: {
      request: string;
      businessArea: string;
      status: string;
      urgency: string;
      dataSensitivity: string;
      created: string;
      priority: string;
      readiness: string;
      nextStep: string;
      builderSignals: string;
      action: string;
    };
    statuses: Record<BusinessCaseStatus, string>;
    priorities: Record<DashboardPriority, string>;
    urgency: Record<BusinessCasePriority, string>;
    sensitivity: Record<DataSensitivityLevel, string>;
    riskLevels: Record<EvaluationRiskLevel, string>;
    readiness: {
      ready: string;
      pending: string;
      storedAssessment: string;
      generatedAssessment: string;
    };
    actions: {
      submitNew: string;
      viewAssessmentComingSoon: string;
    };
    empty: {
      title: string;
      body: string;
    };
    labels: {
      expectedBenefits: string;
      noExpectedBenefits: string;
      topTool: string;
      toolCount: string;
      riskSummary: string;
      score: string;
      unassignedArea: string;
    };
  };
  intake: {
    requiredIndicator: string;
    warningTitle: string;
    warningBody: string;
    sampleNotice: string;
    sections: {
      overview: string;
      context: string;
      dataRisk: string;
      value: string;
      review: string;
    };
    fields: Record<
      IntakeField,
      {
        label: string;
        help?: string;
        placeholder?: string;
      }
    >;
    businessAreas: Record<BusinessArea, string>;
    dataSensitivity: Record<IntakeDataSensitivity, string>;
    urgency: Record<IntakeUrgency, string>;
    expectedBenefits: Record<ExpectedBenefit, string>;
    validation: Record<IntakeValidationCode, string> & {
      summaryTitle: string;
      summaryIntro: string;
    };
    actions: {
      loadSample: string;
      clearForm: string;
      submit: string;
      submitAnother: string;
      viewRequests: string;
      viewAssessments: string;
    };
    success: {
      title: string;
      description: string;
      readyBadge: string;
      assessmentReady: string;
    };
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  "en-CA": {
    app: {
      name: "Marit",
      tagline: "AI business case prioritization",
      skipToContent: "Skip to main content",
      demoNotice: "Demo shell using mock data only. No authentication, database, or live AI is connected.",
    },
    controls: {
      roleLabel: "Demo role",
      localeLabel: "Language",
    },
    roles: {
      businessUser: "Business User",
      aiBuilder: "AI Builder",
      admin: "Admin",
    },
    locales: {
      "en-CA": "English",
      "fr-CA": "French",
    },
    nav: {
      home: "Home",
      dashboard: "Dashboard",
      submit: "Submit Business Case",
      assessments: "Assessments / Reports",
      adminTools: "Admin / Tools",
    },
    landing: {
      eyebrow: "Weekend demo",
      title: "Prioritize AI opportunities with responsible review built in.",
      valueProposition:
        "Marit helps business teams shape AI ideas into consistent business cases while helping the AI Lab evaluate feasibility, tool fit, risk, and responsible AI considerations.",
      primaryCta: "Enter the demo",
      secondaryCta: "Start a business case",
      heroImageAlt:
        "AI Lab team reviewing prioritization cards, responsible AI scores, and tool-fit signals on a large display.",
      whatTitle: "What Marit Is",
      whatBody:
        "Marit is an AI Business Case Prioritization and Evaluation Tool. It helps business teams explore whether AI could address a pain point, while helping an internal AI Lab prioritize and review opportunities.",
      whyTitle: "Why It Exists",
      whyBody: [
        "Business teams often have AI ideas before they know whether those ideas are feasible, safe, affordable, or aligned to available internal tooling.",
        "AI Builders need a fast way to understand the opportunity, risks, likely fit, and responsible AI implications before spending prototyping time.",
        "Marit creates a structured intake and assessment loop so the AI Lab can review more ideas with less manual triage.",
      ],
      howTitle: "How It Works",
      howSteps: [
        "Business team submits an AI opportunity.",
        "Marit structures the request into a consistent business case.",
        "Marit evaluates feasibility, tool fit, risks, and responsible AI considerations.",
        "AI Builders review the assessment and decide the next step.",
        "The AI Lab prioritizes the highest-value, safest, most feasible opportunities.",
      ],
      whoTitle: "Who It Helps",
      businessTeamsTitle: "Business Teams",
      businessTeamsItems: [
        "Clarify the problem they want to solve.",
        "Understand whether AI is likely to help.",
        "Get faster feedback before a prototype is started.",
      ],
      aiBuildersTitle: "AI Builders",
      aiBuildersItems: [
        "Triage requests consistently.",
        "Compare opportunities against available tools.",
        "Identify risks and responsible AI concerns earlier.",
        "Spend more time building the right things.",
      ],
    },
    pages: {
      dashboard: {
        title: "Dashboard",
        description: "Track submitted mock opportunities, assessment readiness, urgency, and priority signals.",
        cardTitle: "Prioritization snapshot",
        cardBody: "This area will show submitted opportunities, status, feasibility, impact, and risk once mock data is added.",
        primaryAction: "View assessment queue",
        secondaryAction: "Review demo scope",
      },
      submit: {
        title: "Submit Business Case",
        description: "Share a fictional AI opportunity so Marit can prepare a mock assessment for review.",
        cardTitle: "Intake foundation",
        cardBody: "The future form will capture the pain point, desired outcome, urgency, data sensitivity, and known data sources.",
        primaryAction: "Start intake draft",
        secondaryAction: "See required details",
      },
      assessments: {
        title: "Assessments / Reports",
        description: "A placeholder for AI-generated assessments reviewed by AI Builders.",
        cardTitle: "Report foundation",
        cardBody: "The first report view will focus on a polished in-app assessment, followed by browser print styling.",
        primaryAction: "Open sample report",
        secondaryAction: "Review AI guidance",
      },
      adminTools: {
        title: "Admin / Tools",
        description: "A placeholder for seeded demo configuration and future tool catalogue management.",
        cardTitle: "Deferred configuration",
        cardBody: "Admin capabilities are represented in navigation, but real configuration features remain outside the first shell.",
        primaryAction: "View seeded tools",
        secondaryAction: "Review constraints",
      },
    },
    badges: {
      mockData: "Mock data only",
      shellOnly: "Shell only",
      rolePrefix: "Current role",
    },
    dashboard: {
      summaryTitle: "Dashboard summary",
      listTitle: "Business cases",
      tableCaption: "Business case requests with status, readiness, urgency, and prioritization signals.",
      roleIntro: {
        businessUser: "Your demo view emphasizes request status, readiness, and next step.",
        aiBuilder: "AI Builder view adds feasibility, tool-fit, and responsible AI risk signals for prioritization.",
        admin: "Admin uses the same demo request list for now; no admin-only workflow is enabled.",
      },
      metrics: {
        totalRequests: "Total requests",
        readyForReview: "Ready for review",
        highUrgency: "High urgency",
        strongFit: "Strong fit",
        highestPriority: "Highest-priority opportunity",
        noHighestPriority: "No requests yet",
      },
      filters: {
        title: "Filter and sort",
        status: "Status",
        businessArea: "Business area",
        urgency: "Urgency",
        sort: "Sort",
        allStatuses: "All statuses",
        allAreas: "All areas",
        allUrgencies: "All urgencies",
      },
      sortOptions: {
        newest: "Newest first",
        urgency: "Urgency",
        priority: "Priority/score",
      },
      columns: {
        request: "Request",
        businessArea: "Business area",
        status: "Status",
        urgency: "Urgency",
        dataSensitivity: "Data sensitivity",
        created: "Created",
        priority: "Priority",
        readiness: "Assessment readiness",
        nextStep: "Next step",
        builderSignals: "Builder signals",
        action: "Action",
      },
      statuses: {
        draft: "Draft",
        submitted: "Submitted",
        ready: "Ready",
        assessed: "Assessed",
        reviewed: "Reviewed",
      },
      priorities: {
        high: "High",
        medium: "Medium",
        low: "Low",
      },
      urgency: {
        low: "Low",
        medium: "Medium",
        high: "High",
      },
      sensitivity: {
        low: "Low",
        medium: "Medium",
        high: "High",
        unknown: "Unknown",
      },
      riskLevels: {
        low: "Low risk",
        moderate: "Moderate risk",
        high: "High risk",
        critical: "Critical risk",
      },
      readiness: {
        ready: "Assessment ready",
        pending: "Assessment pending",
        storedAssessment: "Saved assessment",
        generatedAssessment: "Generated for dashboard",
      },
      actions: {
        submitNew: "Submit new business case",
        viewAssessmentComingSoon: "View assessment coming soon",
      },
      empty: {
        title: "No business cases yet",
        body: "Submit a fictional business case to populate this dashboard.",
      },
      labels: {
        expectedBenefits: "Expected benefits",
        noExpectedBenefits: "No benefits selected",
        topTool: "Top tool",
        toolCount: "{count} recommended tool(s)",
        riskSummary: "Responsible AI risk",
        score: "Score",
        unassignedArea: "Unassigned",
      },
    },
    intake: {
      requiredIndicator: "Required",
      warningTitle: "Mock-data demo only",
      warningBody:
        "Do not enter real client data, confidential data, restricted data, or personal information. Use fictional examples only.",
      sampleNotice: "Sample request loaded. Review the fictional details before submitting.",
      sections: {
        overview: "Opportunity overview",
        context: "Business context",
        dataRisk: "Data and risk",
        value: "Expected value",
        review: "Review and submit",
      },
      fields: {
        title: {
          label: "Title",
          help: "Use a short name for the opportunity.",
          placeholder: "Example: Prioritize internal service desk requests",
        },
        businessArea: {
          label: "Business area / function",
          help: "Choose the area that owns the pain point.",
        },
        painPoint: {
          label: "Pain point",
          help: "Describe what is difficult today. Minimum 40 characters.",
          placeholder: "Describe the problem, who experiences it, and why it matters.",
        },
        currentProcess: {
          label: "Current process",
          help: "Optional: explain how the work is handled today.",
          placeholder: "Describe the manual steps, handoffs, or tools used today.",
        },
        desiredOutcome: {
          label: "Desired outcome",
          help: "Describe the result you want. Minimum 20 characters.",
          placeholder: "Describe what should improve if this opportunity works.",
        },
        affectedPeople: {
          label: "Who is affected",
          help: "Name the fictional teams, roles, or users affected.",
          placeholder: "Example: Operations coordinators and team leads",
        },
        estimatedVolume: {
          label: "Estimated volume/frequency",
          help: "Optional: include approximate fictional volume or cadence.",
          placeholder: "Example: 120 fictional requests per week",
        },
        dataInvolved: {
          label: "Data involved",
          help: "List fictional or mock data sources only. Separate items with commas or line breaks.",
          placeholder: "Example: synthetic request summaries, mock routing guidelines",
        },
        dataSensitivity: {
          label: "Data sensitivity",
          help: "Select all values that might apply to the fictional example.",
        },
        currentTools: {
          label: "Current tools/systems",
          help: "Optional: list systems involved in the current process.",
          placeholder: "Example: shared mailbox, spreadsheet tracker",
        },
        urgency: {
          label: "Urgency",
          help: "Choose the timing pressure for this opportunity.",
        },
        expectedBenefits: {
          label: "Expected benefit",
          help: "Select one or more benefits the team expects.",
        },
        constraints: {
          label: "Constraints or concerns",
          help: "Optional: include review, policy, timeline, or adoption concerns.",
          placeholder: "Example: human review required before routing changes",
        },
        imaginedAiSolution: {
          label: "What AI solution do you imagine?",
          help: "Optional: share the type of AI support you picture.",
          placeholder: "Example: a triage assistant that suggests topic and urgency",
        },
      },
      businessAreas: {
        finance: "Finance",
        hrPeople: "HR / People",
        legal: "Legal",
        risk: "Risk",
        marketing: "Marketing",
        sales: "Sales",
        operations: "Operations",
        its: "ITS",
        audit: "Audit",
        financialTransformation: "Financial Transformation",
        clientService: "Client service",
        knowledgeManagement: "Knowledge management",
        other: "Other",
      },
      dataSensitivity: {
        public: "Public",
        confidential: "Confidential",
        restricted: "Restricted",
        pii: "PII",
        unknown: "Unknown",
      },
      urgency: {
        low: "Low — explore when capacity allows",
        medium: "Medium — useful this quarter",
        high: "High — active business pain",
        critical: "Critical — urgent operational or compliance need",
      },
      expectedBenefits: {
        saveTime: "Save time",
        reduceManualEffort: "Reduce manual effort",
        improveQualityConsistency: "Improve quality/consistency",
        reduceRisk: "Reduce risk",
        improveDecisionMaking: "Improve decision-making",
        improveEmployeeExperience: "Improve employee experience",
        improveClientServiceExperience: "Improve client/service experience",
        reduceCost: "Reduce cost",
        increaseRevenue: "Increase revenue",
        other: "Other",
      },
      validation: {
        summaryTitle: "There is a problem with the form",
        summaryIntro: "Fix the fields below before submitting.",
        required: "{field} is required.",
        minLength: "{field} must be at least {min} characters.",
        minSelected: "Select at least one option for {field}.",
      },
      actions: {
        loadSample: "Load sample request",
        clearForm: "Clear form",
        submit: "Submit business case",
        submitAnother: "Submit another business case",
        viewRequests: "View requests/status",
        viewAssessments: "Go to assessments/reports",
      },
      success: {
        title: "Business case submitted",
        description:
          "Your fictional request was saved for this browser session. The mock assessment is ready for AI Builder review.",
        readyBadge: "Status: Ready",
        assessmentReady: "Assessment generated by deterministic mock evaluator.",
      },
    },
  },
  "fr-CA": {
    app: {
      name: "Marit",
      tagline: "Priorisation des dossiers d'affaires IA",
      skipToContent: "Passer au contenu principal",
      demoNotice: "Coquille de démonstration avec données fictives seulement. Aucune authentification, base de données ni IA en direct n'est connectée.",
    },
    controls: {
      roleLabel: "Rôle de démonstration",
      localeLabel: "Langue",
    },
    roles: {
      businessUser: "Utilisateur d'affaires",
      aiBuilder: "Constructeur IA",
      admin: "Administrateur",
    },
    locales: {
      "en-CA": "Anglais",
      "fr-CA": "Français",
    },
    nav: {
      home: "Accueil",
      dashboard: "Tableau de bord",
      submit: "Soumettre un dossier d'affaires",
      assessments: "Évaluations / Rapports",
      adminTools: "Administration / Outils",
    },
    landing: {
      eyebrow: "Démo de fin de semaine",
      title: "Prioriser les occasions IA avec une révision responsable intégrée.",
      valueProposition:
        "Marit aide les équipes d'affaires à transformer leurs idées IA en dossiers cohérents, tout en aidant le labo IA à évaluer la faisabilité, l'adéquation des outils, les risques et les considérations d'IA responsable.",
      primaryCta: "Entrer dans la démo",
      secondaryCta: "Commencer un dossier",
      heroImageAlt:
        "Équipe du labo IA examinant des cartes de priorisation, des scores d'IA responsable et des signaux d'adéquation des outils sur un grand écran.",
      whatTitle: "Ce qu'est Marit",
      whatBody:
        "Marit est un outil de priorisation et d'évaluation des dossiers d'affaires IA. Il aide les équipes d'affaires à explorer si l'IA pourrait répondre à un problème, tout en aidant un labo IA interne à prioriser et à réviser les occasions.",
      whyTitle: "Pourquoi Marit existe",
      whyBody: [
        "Les équipes d'affaires ont souvent des idées IA avant de savoir si elles sont faisables, sécuritaires, abordables ou alignées avec les outils internes disponibles.",
        "Les constructeurs IA ont besoin d'une façon rapide de comprendre l'occasion, les risques, l'adéquation probable et les implications d'IA responsable avant d'investir du temps de prototypage.",
        "Marit crée une boucle structurée d'accueil et d'évaluation afin que le labo IA puisse réviser plus d'idées avec moins de triage manuel.",
      ],
      howTitle: "Fonctionnement",
      howSteps: [
        "Une équipe d'affaires soumet une occasion IA.",
        "Marit structure la demande en dossier d'affaires cohérent.",
        "Marit évalue la faisabilité, l'adéquation des outils, les risques et les considérations d'IA responsable.",
        "Les constructeurs IA révisent l'évaluation et choisissent la prochaine étape.",
        "Le labo IA priorise les occasions à plus forte valeur, les plus sécuritaires et les plus faisables.",
      ],
      whoTitle: "À qui Marit est utile",
      businessTeamsTitle: "Équipes d'affaires",
      businessTeamsItems: [
        "Clarifier le problème à résoudre.",
        "Comprendre si l'IA est susceptible d'aider.",
        "Obtenir une rétroaction plus rapide avant le démarrage d'un prototype.",
      ],
      aiBuildersTitle: "Constructeurs IA",
      aiBuildersItems: [
        "Trier les demandes de façon cohérente.",
        "Comparer les occasions aux outils disponibles.",
        "Repérer les risques et les enjeux d'IA responsable plus tôt.",
        "Consacrer plus de temps aux bonnes solutions.",
      ],
    },
    pages: {
      dashboard: {
        title: "Tableau de bord",
        description: "Suivez les occasions fictives soumises, l'état des évaluations, l'urgence et les signaux de priorité.",
        cardTitle: "Aperçu de priorisation",
        cardBody: "Cette zone affichera les occasions soumises, leur statut, leur faisabilité, leur impact et leur risque lorsque les données fictives seront ajoutées.",
        primaryAction: "Voir la file d'évaluation",
        secondaryAction: "Examiner la portée de la démo",
      },
      submit: {
        title: "Soumettre un dossier d'affaires",
        description: "Partagez une occasion IA fictive afin que Marit prépare une évaluation simulée pour révision.",
        cardTitle: "Base de l'accueil",
        cardBody: "Le futur formulaire saisira le problème, le résultat souhaité, l'urgence, la sensibilité des données et les sources connues.",
        primaryAction: "Commencer une ébauche",
        secondaryAction: "Voir les détails requis",
      },
      assessments: {
        title: "Évaluations / Rapports",
        description: "Un espace temporaire pour les évaluations générées par l'IA et révisées par les constructeurs IA.",
        cardTitle: "Base du rapport",
        cardBody: "La première vue de rapport misera sur une évaluation soignée dans l'application, puis sur une mise en page d'impression du navigateur.",
        primaryAction: "Ouvrir un exemple de rapport",
        secondaryAction: "Examiner les conseils IA",
      },
      adminTools: {
        title: "Administration / Outils",
        description: "Un espace temporaire pour la configuration fictive et la future gestion du catalogue d'outils.",
        cardTitle: "Configuration reportée",
        cardBody: "Les capacités d'administration sont représentées dans la navigation, mais les vraies fonctions de configuration restent hors de la première coquille.",
        primaryAction: "Voir les outils fictifs",
        secondaryAction: "Examiner les contraintes",
      },
    },
    badges: {
      mockData: "Données fictives seulement",
      shellOnly: "Coquille seulement",
      rolePrefix: "Rôle actuel",
    },
    dashboard: {
      summaryTitle: "Résumé du tableau de bord",
      listTitle: "Dossiers d'affaires",
      tableCaption: "Demandes de dossiers d'affaires avec statut, état d'évaluation, urgence et signaux de priorisation.",
      roleIntro: {
        businessUser: "Votre vue de démonstration met l'accent sur le statut, l'état de l'évaluation et la prochaine étape.",
        aiBuilder: "La vue constructeur IA ajoute des signaux de faisabilité, d'adéquation des outils et de risque IA responsable pour la priorisation.",
        admin: "L'administrateur utilise la même liste de demandes pour l'instant; aucun parcours réservé à l'administration n'est activé.",
      },
      metrics: {
        totalRequests: "Demandes totales",
        readyForReview: "Prêtes pour révision",
        highUrgency: "Urgence élevée",
        strongFit: "Forte adéquation",
        highestPriority: "Occasion la plus prioritaire",
        noHighestPriority: "Aucune demande pour l'instant",
      },
      filters: {
        title: "Filtrer et trier",
        status: "Statut",
        businessArea: "Secteur",
        urgency: "Urgence",
        sort: "Tri",
        allStatuses: "Tous les statuts",
        allAreas: "Tous les secteurs",
        allUrgencies: "Toutes les urgences",
      },
      sortOptions: {
        newest: "Plus récentes d'abord",
        urgency: "Urgence",
        priority: "Priorité/score",
      },
      columns: {
        request: "Demande",
        businessArea: "Secteur",
        status: "Statut",
        urgency: "Urgence",
        dataSensitivity: "Sensibilité des données",
        created: "Créée le",
        priority: "Priorité",
        readiness: "État de l'évaluation",
        nextStep: "Prochaine étape",
        builderSignals: "Signaux constructeur",
        action: "Action",
      },
      statuses: {
        draft: "Ébauche",
        submitted: "Soumise",
        ready: "Prête",
        assessed: "Évaluée",
        reviewed: "Révisée",
      },
      priorities: {
        high: "Élevée",
        medium: "Moyenne",
        low: "Faible",
      },
      urgency: {
        low: "Faible",
        medium: "Moyenne",
        high: "Élevée",
      },
      sensitivity: {
        low: "Faible",
        medium: "Moyenne",
        high: "Élevée",
        unknown: "Inconnue",
      },
      riskLevels: {
        low: "Risque faible",
        moderate: "Risque modéré",
        high: "Risque élevé",
        critical: "Risque critique",
      },
      readiness: {
        ready: "Évaluation prête",
        pending: "Évaluation en attente",
        storedAssessment: "Évaluation enregistrée",
        generatedAssessment: "Générée pour le tableau de bord",
      },
      actions: {
        submitNew: "Soumettre un nouveau dossier",
        viewAssessmentComingSoon: "Évaluation à venir",
      },
      empty: {
        title: "Aucun dossier d'affaires pour l'instant",
        body: "Soumettez un dossier d'affaires fictif pour remplir ce tableau de bord.",
      },
      labels: {
        expectedBenefits: "Bénéfices attendus",
        noExpectedBenefits: "Aucun bénéfice sélectionné",
        topTool: "Outil principal",
        toolCount: "{count} outil(s) recommandé(s)",
        riskSummary: "Risque IA responsable",
        score: "Score",
        unassignedArea: "Non assigné",
      },
    },
    intake: {
      requiredIndicator: "Obligatoire",
      warningTitle: "Démo avec données fictives seulement",
      warningBody:
        "N'entrez pas de vraies données de clients, de données confidentielles, de données restreintes ni de renseignements personnels. Utilisez seulement des exemples fictifs.",
      sampleNotice: "Exemple de demande chargé. Révisez les détails fictifs avant de soumettre.",
      sections: {
        overview: "Aperçu de l'occasion",
        context: "Contexte d'affaires",
        dataRisk: "Données et risques",
        value: "Valeur attendue",
        review: "Réviser et soumettre",
      },
      fields: {
        title: {
          label: "Titre",
          help: "Utilisez un nom court pour l'occasion.",
          placeholder: "Exemple : Prioriser les demandes internes au centre de services",
        },
        businessArea: {
          label: "Secteur / fonction d'affaires",
          help: "Choisissez le secteur responsable du problème.",
        },
        painPoint: {
          label: "Problème",
          help: "Décrivez ce qui est difficile aujourd'hui. Minimum de 40 caractères.",
          placeholder: "Décrivez le problème, les personnes touchées et pourquoi c'est important.",
        },
        currentProcess: {
          label: "Processus actuel",
          help: "Facultatif : expliquez comment le travail est fait aujourd'hui.",
          placeholder: "Décrivez les étapes manuelles, les transferts ou les outils utilisés.",
        },
        desiredOutcome: {
          label: "Résultat souhaité",
          help: "Décrivez le résultat visé. Minimum de 20 caractères.",
          placeholder: "Décrivez ce qui devrait s'améliorer si cette occasion fonctionne.",
        },
        affectedPeople: {
          label: "Personnes touchées",
          help: "Nommez les équipes, rôles ou utilisateurs fictifs touchés.",
          placeholder: "Exemple : coordonnateurs des opérations et chefs d'équipe",
        },
        estimatedVolume: {
          label: "Volume/fréquence estimés",
          help: "Facultatif : indiquez un volume ou une cadence fictive approximative.",
          placeholder: "Exemple : 120 demandes fictives par semaine",
        },
        dataInvolved: {
          label: "Données concernées",
          help: "Listez seulement des sources de données fictives ou simulées. Séparez les éléments par des virgules ou des sauts de ligne.",
          placeholder: "Exemple : résumés de demandes synthétiques, règles de routage fictives",
        },
        dataSensitivity: {
          label: "Sensibilité des données",
          help: "Sélectionnez toutes les valeurs qui pourraient s'appliquer à l'exemple fictif.",
        },
        currentTools: {
          label: "Outils/systèmes actuels",
          help: "Facultatif : listez les systèmes utilisés dans le processus actuel.",
          placeholder: "Exemple : boîte courriel partagée, registre dans un chiffrier",
        },
        urgency: {
          label: "Urgence",
          help: "Choisissez la pression de calendrier pour cette occasion.",
        },
        expectedBenefits: {
          label: "Bénéfice attendu",
          help: "Sélectionnez un ou plusieurs bénéfices attendus par l'équipe.",
        },
        constraints: {
          label: "Contraintes ou préoccupations",
          help: "Facultatif : indiquez les enjeux de révision, de politiques, d'échéancier ou d'adoption.",
          placeholder: "Exemple : révision humaine requise avant tout changement de routage",
        },
        imaginedAiSolution: {
          label: "Quelle solution IA imaginez-vous?",
          help: "Facultatif : partagez le type de soutien IA envisagé.",
          placeholder: "Exemple : un assistant de triage qui suggère le sujet et l'urgence",
        },
      },
      businessAreas: {
        finance: "Finance",
        hrPeople: "RH / Personnes",
        legal: "Juridique",
        risk: "Risque",
        marketing: "Marketing",
        sales: "Ventes",
        operations: "Opérations",
        its: "ITS",
        audit: "Audit",
        financialTransformation: "Transformation financière",
        clientService: "Service à la clientèle",
        knowledgeManagement: "Gestion des connaissances",
        other: "Autre",
      },
      dataSensitivity: {
        public: "Publique",
        confidential: "Confidentielle",
        restricted: "Restreinte",
        pii: "Renseignements personnels",
        unknown: "Inconnue",
      },
      urgency: {
        low: "Faible — explorer lorsque la capacité le permet",
        medium: "Moyenne — utile ce trimestre",
        high: "Élevée — problème d'affaires actif",
        critical: "Critique — besoin opérationnel ou de conformité urgent",
      },
      expectedBenefits: {
        saveTime: "Gagner du temps",
        reduceManualEffort: "Réduire l'effort manuel",
        improveQualityConsistency: "Améliorer la qualité/cohérence",
        reduceRisk: "Réduire le risque",
        improveDecisionMaking: "Améliorer la prise de décision",
        improveEmployeeExperience: "Améliorer l'expérience employé",
        improveClientServiceExperience: "Améliorer l'expérience client/service",
        reduceCost: "Réduire les coûts",
        increaseRevenue: "Augmenter les revenus",
        other: "Autre",
      },
      validation: {
        summaryTitle: "Le formulaire contient un problème",
        summaryIntro: "Corrigez les champs ci-dessous avant de soumettre.",
        required: "{field} est obligatoire.",
        minLength: "{field} doit contenir au moins {min} caractères.",
        minSelected: "Sélectionnez au moins une option pour {field}.",
      },
      actions: {
        loadSample: "Charger un exemple",
        clearForm: "Effacer le formulaire",
        submit: "Soumettre le dossier",
        submitAnother: "Soumettre un autre dossier",
        viewRequests: "Voir les demandes/statuts",
        viewAssessments: "Aller aux évaluations/rapports",
      },
      success: {
        title: "Dossier d'affaires soumis",
        description:
          "Votre demande fictive a été enregistrée pour cette session de navigateur. L'évaluation simulée est prête pour la révision par un constructeur IA.",
        readyBadge: "Statut : prêt",
        assessmentReady: "Évaluation générée par l'évaluateur déterministe fictif.",
      },
    },
  },
};

export const defaultLocale: Locale = "en-CA";
export const defaultRole: Role = "businessUser";
export const defaultPage: PageKey = "home";
