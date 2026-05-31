"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import {
  buildDashboardRows,
  dashboardStatusOptions,
  dashboardUrgencyOptions,
  displayBusinessArea,
  displayExpectedBenefits,
  emptyDashboardFilters,
  filterDashboardRows,
  getAvailableBusinessAreas,
  sortDashboardRows,
  summarizeDashboard,
  type DashboardFilters,
  type DashboardRow,
  type DashboardSort,
} from "@/lib/dashboard/businessCaseDashboard";
import { aiTools, responsibleAiPillars } from "@/lib/data";
import { createLocalStorageBusinessCaseRepository } from "@/lib/data/mockBusinessCaseRepository";
import type { BusinessArea } from "@/lib/domain/types";
import { DeterministicEvaluationService } from "@/lib/evaluation";
import type { Dictionary, Locale, Role, ShellPageKey } from "@/lib/i18n/dictionaries";

type BusinessCaseDashboardProps = {
  dictionary: Dictionary;
  locale: Locale;
  role: Role;
  onNavigate: (page: ShellPageKey) => void;
};

export function BusinessCaseDashboard({
  dictionary,
  locale,
  role,
  onNavigate,
}: BusinessCaseDashboardProps) {
  const [filters, setFilters] = useState<DashboardFilters>(emptyDashboardFilters);
  const [sort, setSort] = useState<DashboardSort>("newest");
  const [rows, setRows] = useState<DashboardRow[]>([]);
  const evaluator = useMemo(() => new DeterministicEvaluationService(), []);
  const dashboard = dictionary.dashboard;

  useEffect(() => {
    const repository = createLocalStorageBusinessCaseRepository(window.localStorage);
    setRows(buildDashboardRows({
      businessCases: repository.listBusinessCases(),
      assessments: repository.listAssessments(),
      evaluator,
      tools: aiTools,
      pillars: responsibleAiPillars,
    }));
  }, [evaluator]);
  const summary = summarizeDashboard(rows);
  const availableAreas = getAvailableBusinessAreas(rows);
  const displayedRows = sortDashboardRows(filterDashboardRows(rows, filters), sort);

  function updateFilter<T extends keyof DashboardFilters>(field: T, value: DashboardFilters[T]) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="dashboard">
      <div className="dashboard-intro">
        <p>{dashboard.roleIntro[role]}</p>
        <Button onClick={() => onNavigate("submit")}>{dashboard.actions.submitNew}</Button>
      </div>

      <section className="metric-grid" aria-labelledby="dashboard-summary-title">
        <h2 className="visually-hidden" id="dashboard-summary-title">
          {dashboard.summaryTitle}
        </h2>
        <MetricCard label={dashboard.metrics.totalRequests} value={String(summary.totalRequests)} />
        <MetricCard label={dashboard.metrics.readyForReview} value={String(summary.readyForReview)} />
        <MetricCard label={dashboard.metrics.highUrgency} value={String(summary.highUrgency)} />
        <MetricCard label={dashboard.metrics.strongFit} value={String(summary.strongFit)} />
        <MetricCard
          label={dashboard.metrics.highestPriority}
          value={summary.highestPriority?.businessCase.title ?? dashboard.metrics.noHighestPriority}
        />
      </section>

      <Card className="dashboard-controls">
        <h2>{dashboard.filters.title}</h2>
        <div className="filter-grid">
          <label className="field">
            <span className="field__label">{dashboard.filters.status}</span>
            <select
              className="select"
              onChange={(event) =>
                updateFilter("status", event.target.value as DashboardFilters["status"])
              }
              value={filters.status}
            >
              <option value="all">{dashboard.filters.allStatuses}</option>
              {dashboardStatusOptions.map((status) => (
                <option key={status} value={status}>
                  {dashboard.statuses[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{dashboard.filters.businessArea}</span>
            <select
              className="select"
              onChange={(event) =>
                updateFilter("businessArea", event.target.value as DashboardFilters["businessArea"])
              }
              value={filters.businessArea}
            >
              <option value="all">{dashboard.filters.allAreas}</option>
              {availableAreas.map((area) => (
                <option key={area} value={area}>
                  {areaLabel(area, dictionary)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{dashboard.filters.urgency}</span>
            <select
              className="select"
              onChange={(event) =>
                updateFilter("urgency", event.target.value as DashboardFilters["urgency"])
              }
              value={filters.urgency}
            >
              <option value="all">{dashboard.filters.allUrgencies}</option>
              {dashboardUrgencyOptions.map((urgency) => (
                <option key={urgency} value={urgency}>
                  {dashboard.urgency[urgency]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{dashboard.filters.sort}</span>
            <select
              className="select"
              onChange={(event) => setSort(event.target.value as DashboardSort)}
              value={sort}
            >
              {(Object.keys(dashboard.sortOptions) as DashboardSort[]).map((sortOption) => (
                <option key={sortOption} value={sortOption}>
                  {dashboard.sortOptions[sortOption]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Card>

      <Card className="dashboard-list">
        <div className="dashboard-list__header">
          <h2>{dashboard.listTitle}</h2>
          <p className="muted">{dashboard.tableCaption}</p>
        </div>

        {displayedRows.length === 0 ? (
          <div className="empty-state">
            <h3>{dashboard.empty.title}</h3>
            <p className="muted">{dashboard.empty.body}</p>
            <Button onClick={() => onNavigate("submit")}>{dashboard.actions.submitNew}</Button>
          </div>
        ) : (
          <div className="table-scroll">
            <table className="case-table">
              <caption>{dashboard.tableCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{dashboard.columns.request}</th>
                  <th scope="col">{dashboard.columns.businessArea}</th>
                  <th scope="col">{dashboard.columns.status}</th>
                  <th scope="col">{dashboard.columns.urgency}</th>
                  <th scope="col">{dashboard.columns.dataSensitivity}</th>
                  <th scope="col">{dashboard.columns.created}</th>
                  <th scope="col">{dashboard.columns.priority}</th>
                  <th scope="col">{dashboard.columns.readiness}</th>
                  <th scope="col">
                    {role === "businessUser"
                      ? dashboard.columns.nextStep
                      : dashboard.columns.builderSignals}
                  </th>
                  <th scope="col">{dashboard.columns.action}</th>
                </tr>
              </thead>
              <tbody>
                {displayedRows.map((row) => {
                  const businessCase = row.businessCase;
                  const benefits = displayExpectedBenefits(businessCase);

                  return (
                    <tr key={businessCase.id}>
                      <th scope="row">
                        <span className="case-table__title">{businessCase.title}</span>
                        <span className="case-table__meta">
                          {dashboard.labels.expectedBenefits}:{" "}
                          {benefits.length > 0
                            ? benefits.map((benefit) => dictionary.intake.expectedBenefits[benefit]).join(", ")
                            : dashboard.labels.noExpectedBenefits}
                        </span>
                      </th>
                      <td data-label={dashboard.columns.businessArea}>
                        {areaLabel(displayBusinessArea(businessCase), dictionary)}
                      </td>
                      <td data-label={dashboard.columns.status}>
                        <Badge variant={businessCase.status === "ready" ? "status" : "neutral"}>
                          {dashboard.statuses[businessCase.status]}
                        </Badge>
                      </td>
                      <td data-label={dashboard.columns.urgency}>
                        {dashboard.urgency[businessCase.urgency]}
                      </td>
                      <td data-label={dashboard.columns.dataSensitivity}>
                        {dashboard.sensitivity[businessCase.dataSensitivity]}
                      </td>
                      <td data-label={dashboard.columns.created}>
                        {formatDate(businessCase.createdAt, locale)}
                      </td>
                      <td data-label={dashboard.columns.priority}>
                        <span className={`priority-pill priority-pill--${row.priority}`}>
                          {dashboard.priorities[row.priority]}
                        </span>
                        <span className="case-table__meta">
                          {dashboard.labels.score}: {row.score}
                        </span>
                      </td>
                      <td data-label={dashboard.columns.readiness}>
                        <span>{row.assessmentReady ? dashboard.readiness.ready : dashboard.readiness.pending}</span>
                        <span className="case-table__meta">
                          {row.assessmentSource === "stored"
                            ? dashboard.readiness.storedAssessment
                            : dashboard.readiness.generatedAssessment}
                        </span>
                      </td>
                      <td
                        data-label={
                          role === "businessUser"
                            ? dashboard.columns.nextStep
                            : dashboard.columns.builderSignals
                        }
                      >
                        {role === "businessUser" ? (
                          row.assessment.recommendedNextStep
                        ) : (
                          <span className="builder-signals">
                            <span>
                              {dashboard.labels.riskSummary}: {dashboard.riskLevels[row.riskLevel]}
                            </span>
                            <span>
                              {row.topRecommendedToolName
                                ? `${dashboard.labels.topTool}: ${row.topRecommendedToolName}`
                                : dashboard.labels.toolCount.replace(
                                    "{count}",
                                    String(row.recommendedToolsCount),
                                  )}
                            </span>
                          </span>
                        )}
                      </td>
                      <td data-label={dashboard.columns.action}>
                        <Button disabled variant="secondary">
                          {dashboard.actions.viewAssessmentComingSoon}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="metric-card">
      <span className="metric-card__label">{label}</span>
      <strong className="metric-card__value">{value}</strong>
    </Card>
  );
}

function areaLabel(area: BusinessArea | "unassigned", dictionary: Dictionary): string {
  return area === "unassigned" ? dictionary.dashboard.labels.unassignedArea : dictionary.intake.businessAreas[area];
}

function formatDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
