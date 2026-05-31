"use client";

import { useEffect, useState } from "react";
import { AdminAiToolsPage } from "@/components/AdminAiToolsPage";
import { Badge } from "@/components/Badge";
import { BusinessCaseAssessmentReport } from "@/components/BusinessCaseAssessmentReport";
import { BusinessCaseDashboard } from "@/components/BusinessCaseDashboard";
import { BusinessCaseIntakeForm } from "@/components/BusinessCaseIntakeForm";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { LandingPage } from "@/components/LandingPage";
import { PageHeader } from "@/components/PageHeader";
import {
  defaultLocale,
  defaultPage,
  defaultRole,
  dictionaries,
  locales,
  type Locale,
  type PageKey,
  type Role,
  type ShellPageKey,
} from "@/lib/i18n/dictionaries";
import { canAccessAdminTools, visiblePagesForRole } from "@/lib/admin/aiToolManagement";

const pageOrder: PageKey[] = ["home", "dashboard", "submit", "assessments", "adminTools"];
const roleOrder: Role[] = ["businessUser", "aiBuilder", "admin"];

export function AppShell() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [role, setRole] = useState<Role>(defaultRole);
  const [activePage, setActivePage] = useState<PageKey>(defaultPage);
  const [selectedBusinessCaseId, setSelectedBusinessCaseId] = useState<string | null>(null);
  const dictionary = dictionaries[locale];
  const page = activePage === "home" ? null : dictionary.pages[activePage];
  const visiblePages = visiblePagesForRole(pageOrder, role);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (activePage === "adminTools" && !canAccessAdminTools(role)) {
      setActivePage("dashboard");
    }
  }, [activePage, role]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {dictionary.app.skipToContent}
      </a>

      <header className="app-header">
        <div className="brand" aria-label={dictionary.app.name}>
          <span className="brand__name">{dictionary.app.name}</span>
          <span className="brand__tagline">{dictionary.app.tagline}</span>
        </div>

        <div className="header-controls" aria-label={dictionary.app.demoNotice}>
          <label className="field">
            <span className="field__label">{dictionary.controls.roleLabel}</span>
            <select
              className="select"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
            >
              {roleOrder.map((roleKey) => (
                <option key={roleKey} value={roleKey}>
                  {dictionary.roles[roleKey]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span className="field__label">{dictionary.controls.localeLabel}</span>
            <select
              className="select"
              value={locale}
              onChange={(event) => setLocale(event.target.value as Locale)}
            >
              {locales.map((localeKey) => (
                <option key={localeKey} value={localeKey}>
                  {dictionary.locales[localeKey]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="shell-grid">
        <aside className="sidebar">
          <nav aria-label={dictionary.app.name}>
            <ul className="nav-list">
              {visiblePages.map((pageKey) => (
                <li key={pageKey}>
                  <button
                    aria-current={activePage === pageKey ? "page" : undefined}
                    className="nav-button"
                    onClick={() => setActivePage(pageKey)}
                    type="button"
                  >
                    {dictionary.nav[pageKey]}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="main" id="main-content" tabIndex={-1}>
          <div className="content-stack">
            {activePage === "home" ? (
              <LandingPage
                dictionary={dictionary}
                onNavigate={(pageKey: ShellPageKey) => setActivePage(pageKey)}
              />
            ) : (
              page && (
                <>
                  <PageHeader title={page.title} description={page.description} />

                  <div className="badge-row" aria-label={dictionary.app.demoNotice}>
                    <Badge variant="role">
                      {dictionary.badges.rolePrefix}: {dictionary.roles[role]}
                    </Badge>
                    <Badge variant="status">{dictionary.badges.mockData}</Badge>
                    {activePage === "submit" || activePage === "dashboard" || activePage === "adminTools" ? null : (
                      <Badge>{dictionary.badges.shellOnly}</Badge>
                    )}
                  </div>

                  {activePage === "adminTools" && !canAccessAdminTools(role) ? (
                    <Card>
                      <h2>{dictionary.adminTools.accessDeniedTitle}</h2>
                      <p className="muted">{dictionary.adminTools.accessDeniedBody}</p>
                      <div className="actions">
                        <Button onClick={() => setActivePage("dashboard")} variant="secondary">
                          {dictionary.adminTools.actions.backToDashboard}
                        </Button>
                      </div>
                    </Card>
                  ) : activePage === "dashboard" ? (
                    <BusinessCaseDashboard
                      dictionary={dictionary}
                      locale={locale}
                      role={role}
                      onNavigate={(pageKey: ShellPageKey) => setActivePage(pageKey)}
                      onViewAssessment={(businessCaseId) => {
                        setSelectedBusinessCaseId(businessCaseId);
                        setActivePage("assessments");
                      }}
                    />
                  ) : activePage === "submit" ? (
                    <BusinessCaseIntakeForm
                      dictionary={dictionary}
                      onNavigate={(pageKey: ShellPageKey) => setActivePage(pageKey)}
                    />
                  ) : activePage === "assessments" ? (
                    <BusinessCaseAssessmentReport
                      dictionary={dictionary}
                      locale={locale}
                      selectedBusinessCaseId={selectedBusinessCaseId}
                      onBackToDashboard={() => setActivePage("dashboard")}
                      onSubmitAnother={() => setActivePage("submit")}
                    />
                  ) : activePage === "adminTools" ? (
                    <AdminAiToolsPage
                      dictionary={dictionary}
                      locale={locale}
                      onBackToDashboard={() => setActivePage("dashboard")}
                    />
                  ) : (
                    <>
                      <Card>
                        <h2>{page.cardTitle}</h2>
                        <p className="muted">{page.cardBody}</p>
                        <div className="actions">
                          <Button>{page.primaryAction}</Button>
                          <Button variant="secondary">{page.secondaryAction}</Button>
                        </div>
                      </Card>

                      <div className="placeholder-grid" aria-label={dictionary.nav[activePage]}>
                        <Card>
                          <h3>{dictionary.badges.mockData}</h3>
                          <p className="muted">{dictionary.app.demoNotice}</p>
                        </Card>
                        <Card>
                          <h3>{dictionary.controls.roleLabel}</h3>
                          <p className="muted">
                            {dictionary.badges.rolePrefix}: {dictionary.roles[role]}
                          </p>
                        </Card>
                        <Card>
                          <h3>{dictionary.controls.localeLabel}</h3>
                          <p className="muted">{dictionary.locales[locale]}</p>
                        </Card>
                      </div>
                    </>
                  )}
                </>
              )
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
