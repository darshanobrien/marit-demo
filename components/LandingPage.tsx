import Image from "next/image";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import type { Dictionary, ShellPageKey } from "@/lib/i18n/dictionaries";

type LandingPageProps = {
  dictionary: Dictionary;
  onNavigate: (page: ShellPageKey) => void;
};

export function LandingPage({ dictionary, onNavigate }: LandingPageProps) {
  const landing = dictionary.landing;

  return (
    <div className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <Image
          priority
          fill
          className="landing-hero__image"
          src="/images/marit-landing-hero.png"
          alt={landing.heroImageAlt}
          sizes="100vw"
        />
        <div className="landing-hero__overlay" aria-hidden="true" />
        <div className="landing-hero__content">
          <p className="landing-eyebrow">{landing.eyebrow}</p>
          <h1 id="landing-title">{landing.title}</h1>
          <p className="landing-value">{landing.valueProposition}</p>
          <div className="actions">
            <Button onClick={() => onNavigate("dashboard")}>{landing.primaryCta}</Button>
            <Button onClick={() => onNavigate("submit")} variant="secondary">
              {landing.secondaryCta}
            </Button>
          </div>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="what-marit-is">
        <div className="landing-section__inner landing-two-column">
          <div>
            <p className="section-kicker">{dictionary.app.name}</p>
            <h2 id="what-marit-is">{landing.whatTitle}</h2>
          </div>
          <p className="landing-large-copy">{landing.whatBody}</p>
        </div>
      </section>

      <section className="landing-section landing-section--muted" aria-labelledby="why-marit-exists">
        <div className="landing-section__inner">
          <h2 id="why-marit-exists">{landing.whyTitle}</h2>
          <div className="landing-copy-grid">
            {landing.whyBody.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-section" aria-labelledby="how-it-works">
        <div className="landing-section__inner">
          <h2 id="how-it-works">{landing.howTitle}</h2>
          <ol className="step-list">
            {landing.howSteps.map((step, index) => (
              <li key={step}>
                <span className="step-list__number" aria-hidden="true">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="landing-section landing-section--muted" aria-labelledby="who-it-helps">
        <div className="landing-section__inner">
          <h2 id="who-it-helps">{landing.whoTitle}</h2>
          <div className="audience-grid">
            <Card>
              <h3>{landing.businessTeamsTitle}</h3>
              <ul className="check-list">
                {landing.businessTeamsItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
            <Card>
              <h3>{landing.aiBuildersTitle}</h3>
              <ul className="check-list">
                {landing.aiBuildersItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
