"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  displayBusinessArea,
  displayExpectedBenefits,
  isAssessmentReady,
} from "@/lib/dashboard/businessCaseDashboard";
import { responsibleAiPillars } from "@/lib/data";
import { createLocalStorageAIToolRepository } from "@/lib/data/mockAiToolRepository";
import { createLocalStorageBusinessCaseRepository } from "@/lib/data/mockBusinessCaseRepository";
import type {
  BusinessArea,
  BusinessCase,
  EvaluationConcern,
  EvaluationProCon,
} from "@/lib/domain/types";
import { DeterministicEvaluationService } from "@/lib/evaluation";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import {
  buildAssessmentReportModel,
  type AssessmentReportModel,
  type ReportPillarAssessment,
  type ReportToolRecommendation,
} from "@/lib/report/businessCaseAssessmentReport";

type BusinessCaseAssessmentReportProps = {
  dictionary: Dictionary;
  locale: Locale;
  selectedBusinessCaseId: string | null;
  onBackToDashboard: () => void;
  onSubmitAnother: () => void;
};

export function BusinessCaseAssessmentReport({
  dictionary,
  locale,
  selectedBusinessCaseId,
  onBackToDashboard,
  onSubmitAnother,
}: BusinessCaseAssessmentReportProps) {
  const [model, setModel] = useState<AssessmentReportModel | null>(null);
  const evaluator = useMemo(() => new DeterministicEvaluationService(), []);
  const report = dictionary.report;

  useEffect(() => {
    if (!selectedBusinessCaseId) {
      setModel(null);
      return;
    }

    const repository = createLocalStorageBusinessCaseRepository(window.localStorage);
    setModel(
      buildAssessmentReportModel({
        businessCaseId: selectedBusinessCaseId,
        businessCases: repository.listBusinessCases(),
        assessments: repository.listAssessments(),
        evaluator,
        tools: createLocalStorageAIToolRepository(window.localStorage).listTools(),
        pillars: responsibleAiPillars,
      }),
    );
  }, [evaluator, selectedBusinessCaseId]);

  if (!selectedBusinessCaseId) {
    return (
      <ReportStateCard
        body={report.emptyBody}
        dictionary={dictionary}
        onBackToDashboard={onBackToDashboard}
        title={report.emptyTitle}
      />
    );
  }

  if (!model) {
    return null;
  }

  if (model.state === "notFound") {
    return (
      <ReportStateCard
        body={report.notFoundBody}
        dictionary={dictionary}
        onBackToDashboard={onBackToDashboard}
        title={report.notFoundTitle}
      />
    );
  }

  const { businessCase, assessment } = model;
  const assessmentReady = isAssessmentReady(businessCase.status);

  return (
    <article className="report-view" aria-labelledby="report-title">
      <div className="report-actions no-print">
        <Button onClick={onBackToDashboard} variant="secondary">
          {report.actions.backToDashboard}
        </Button>
        <Button onClick={onSubmitAnother} variant="secondary">
          {report.actions.submitAnother}
        </Button>
        <Button onClick={() => window.print()}>{report.actions.print}</Button>
      </div>

      <section className="report-disclaimer" aria-labelledby="report-disclaimer-title">
        <h2 id="report-disclaimer-title">{report.demoDisclaimerTitle}</h2>
        <p>{report.demoDisclaimerBody}</p>
      </section>

      <Card className="report-hero">
        <div>
          <p className="report-kicker">{report.printTitle}</p>
          <h2 id="report-title">{businessCase.title}</h2>
        </div>
        <div className="report-badge-grid" aria-label={report.sections.header}>
          <Badge variant={businessCase.status === "ready" ? "status" : "neutral"}>
            {dictionary.dashboard.statuses[businessCase.status]}
          </Badge>
          <Badge>{assessmentReady ? dictionary.dashboard.readiness.ready : dictionary.dashboard.readiness.pending}</Badge>
          <Badge>{model.assessmentSource === "stored" ? report.sourceStored : report.sourceGenerated}</Badge>
        </div>
        <dl className="report-meta-grid">
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.businessArea} value={areaLabel(displayBusinessArea(businessCase), dictionary)} />
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.urgency} value={dictionary.dashboard.urgency[businessCase.urgency]} />
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.dataSensitivity} value={dictionary.dashboard.sensitivity[businessCase.dataSensitivity]} />
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.created} value={formatDate(businessCase.createdAt, locale)} />
        </dl>
      </Card>

      <section className="report-section-grid report-section-grid--summary">
        <ScoreCard
          label={report.fields.overallScore}
          level={dictionary.dashboard.riskLevels[assessment.overallScore.level]}
          score={assessment.overallScore.value}
        />
        <ScoreCard
          label={report.fields.feasibilityScore}
          level={dictionary.dashboard.riskLevels[assessment.feasibility.score.level]}
          score={assessment.feasibility.score.value}
        />
        <Card className="report-section">
          <h2>{report.sections.executiveSummary}</h2>
          <dl className="report-detail-list">
            <ReportField emptyLabel={report.fields.noValue} label={report.fields.confidence} value={report.confidence[assessment.confidence]} />
            <ReportField emptyLabel={report.fields.noValue} label={report.fields.recommendation} value={report.recommendations[assessment.recommendation]} />
            <ReportField emptyLabel={report.fields.noValue} label={report.fields.recommendedNextStep} value={assessment.recommendedNextStep} />
          </dl>
          <p className="muted">{assessment.feasibility.summary}</p>
        </Card>
      </section>

      <Card className="report-section">
        <h2>{report.sections.submittedCase}</h2>
        <dl className="report-detail-grid">
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.painPoint} value={businessCase.painPoint} />
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.currentProcess} value={businessCase.currentProcess} />
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.desiredOutcome} value={businessCase.desiredOutcome} />
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.affectedPeople} value={businessCase.affectedPeople ?? businessCase.expectedUsers} />
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.estimatedVolume} value={businessCase.estimatedVolume} />
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.dataInvolved} value={formatList(businessCase.knownDataSources, report.fields.noItems)} />
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.currentTools} value={businessCase.currentTools} />
          <ReportField
            label={report.fields.expectedBenefits}
            value={formatBenefits(businessCase, dictionary)}
            emptyLabel={report.fields.noValue}
          />
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.constraints} value={formatList(businessCase.constraints ?? [], report.fields.noItems)} />
          <ReportField emptyLabel={report.fields.noValue} label={report.fields.imaginedAiSolution} value={businessCase.imaginedAiSolution} />
        </dl>
      </Card>

      <Card className="report-section">
        <h2>{report.sections.toolFit}</h2>
        {model.recommendedTools.length > 0 ? (
          <div className="report-card-grid">
            {model.recommendedTools.map((recommendation) => (
              <ToolFitCard
                dictionary={dictionary}
                key={recommendation.toolId}
                recommendation={recommendation}
              />
            ))}
          </div>
        ) : (
          <p className="muted">{report.fields.noTools}</p>
        )}
      </Card>

      <Card className="report-section">
        <h2>{report.sections.responsibleAiScoring}</h2>
        <div className="pillar-list">
          {model.pillarAssessments.map((pillarAssessment) => (
            <PillarCard
              dictionary={dictionary}
              key={pillarAssessment.pillarId}
              pillarAssessment={pillarAssessment}
            />
          ))}
        </div>
      </Card>

      <section className="report-section-grid">
        <ListCard
          emptyLabel={report.fields.noItems}
          items={assessment.pros}
          title={report.fields.pros}
        />
        <ListCard
          emptyLabel={report.fields.noItems}
          items={assessment.cons}
          title={report.fields.cons}
        />
      </section>

      <Card className="report-section">
        <h2>{report.sections.concernsMitigations}</h2>
        <div className="report-section-grid">
          <ListCard
            emptyLabel={report.fields.noItems}
            items={assessment.concerns}
            title={report.fields.concerns}
          />
          <TextListCard
            emptyLabel={report.fields.noItems}
            items={assessment.mitigationIdeas}
            title={report.fields.mitigationIdeas}
          />
        </div>
      </Card>

      <Card className="report-section">
        <h2>{report.sections.reviewerContext}</h2>
        <ul className="report-list">
          {report.reviewGuidance.map((guidance) => (
            <li key={guidance}>{guidance}</li>
          ))}
        </ul>
      </Card>
    </article>
  );
}

function ReportStateCard({
  body,
  dictionary,
  onBackToDashboard,
  title,
}: {
  body: string;
  dictionary: Dictionary;
  onBackToDashboard: () => void;
  title: string;
}) {
  return (
    <Card className="empty-state">
      <h2>{title}</h2>
      <p className="muted">{body}</p>
      <Button onClick={onBackToDashboard}>{dictionary.report.actions.backToDashboard}</Button>
    </Card>
  );
}

function ScoreCard({ label, level, score }: { label: string; level: string; score: number }) {
  return (
    <Card className="score-card">
      <span className="score-card__label">{label}</span>
      <strong className="score-card__score">{score}</strong>
      <span className="score-card__level">{level}</span>
    </Card>
  );
}

function ToolFitCard({
  dictionary,
  recommendation,
}: {
  dictionary: Dictionary;
  recommendation: ReportToolRecommendation;
}) {
  const report = dictionary.report;

  return (
    <section className="report-mini-card" aria-labelledby={`${recommendation.toolId}-title`}>
      <h3 id={`${recommendation.toolId}-title`}>
        {recommendation.tool?.name ?? recommendation.toolId}
      </h3>
      {recommendation.tool?.shortDescription ? <p>{recommendation.tool.shortDescription}</p> : null}
      <dl className="report-detail-list">
        <ReportField
          emptyLabel={report.fields.noValue}
          label={report.fields.fitScore}
          value={`${recommendation.fitScore.value} (${dictionary.dashboard.riskLevels[recommendation.fitScore.level]})`}
        />
        <ReportField emptyLabel={report.fields.noValue} label={report.fields.explanation} value={recommendation.rationale} />
        <ReportField
          emptyLabel={report.fields.noValue}
          label={report.fields.implementationComplexity}
          value={
            recommendation.tool
              ? report.complexity[recommendation.tool.implementationComplexity]
              : undefined
          }
        />
        <ReportField
          emptyLabel={report.fields.noValue}
          label={report.fields.limitations}
          value={formatList(recommendation.limitations, report.fields.noItems)}
        />
      </dl>
    </section>
  );
}

function PillarCard({
  dictionary,
  pillarAssessment,
}: {
  dictionary: Dictionary;
  pillarAssessment: ReportPillarAssessment;
}) {
  const report = dictionary.report;

  return (
    <section className="pillar-card" aria-labelledby={`${pillarAssessment.pillarId}-title`}>
      <div className="pillar-card__header">
        <h3 id={`${pillarAssessment.pillarId}-title`}>
          {pillarAssessment.pillar?.name ?? pillarAssessment.pillarId}
        </h3>
        <span className="priority-pill priority-pill--medium">
          {report.fields.riskScore}: {pillarAssessment.riskScore.value} (
          {dictionary.dashboard.riskLevels[pillarAssessment.riskScore.level]})
        </span>
      </div>
      <p className="muted">{pillarAssessment.pillar?.description}</p>
      <p>{pillarAssessment.explanation}</p>
      <div className="pillar-card__grid">
        <ListCard
          emptyLabel={report.fields.noItems}
          items={pillarAssessment.concerns}
          title={report.fields.concerns}
        />
        <ListCard
          emptyLabel={report.fields.noItems}
          items={pillarAssessment.pros}
          title={report.fields.pros}
        />
        <ListCard
          emptyLabel={report.fields.noItems}
          items={pillarAssessment.cons}
          title={report.fields.cons}
        />
        <TextListCard
          emptyLabel={report.fields.noItems}
          items={pillarAssessment.mitigationIdeas}
          title={report.fields.mitigationIdeas}
        />
      </div>
    </section>
  );
}

function ListCard({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: Array<EvaluationConcern | EvaluationProCon>;
  title: string;
}) {
  return (
    <section className="report-list-card">
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul className="report-list">
          {items.map((item) => (
            <li key={item.id}>{"description" in item ? item.description : ""}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">{emptyLabel}</p>
      )}
    </section>
  );
}

function TextListCard({
  emptyLabel,
  items,
  title,
}: {
  emptyLabel: string;
  items: string[];
  title: string;
}) {
  return (
    <section className="report-list-card">
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul className="report-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="muted">{emptyLabel}</p>
      )}
    </section>
  );
}

function ReportField({
  emptyLabel,
  label,
  value,
}: {
  emptyLabel: string;
  label: string;
  value?: string;
}) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value?.trim() ? value : emptyLabel}</dd>
    </>
  );
}

function areaLabel(area: BusinessArea | "unassigned", dictionary: Dictionary): string {
  return area === "unassigned" ? dictionary.dashboard.labels.unassignedArea : dictionary.intake.businessAreas[area];
}

function formatBenefits(businessCase: BusinessCase, dictionary: Dictionary): string {
  const benefits = displayExpectedBenefits(businessCase);

  return benefits.length > 0
    ? benefits.map((benefit) => dictionary.intake.expectedBenefits[benefit]).join(", ")
    : dictionary.report.fields.noItems;
}

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function formatList(items: string[], emptyLabel: string): string {
  return items.length > 0 ? items.join(", ") : emptyLabel;
}
