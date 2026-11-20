import { Button, ButtonLink } from "@/components/ui/Button/Button";
import styles from "./page.module.css";

const variants = ["primary", "secondary", "tertiary"] as const;
const themes = ["lime", "light", "dark"] as const;

export default function Home() {
  return (
    <main className={styles.page}>
      <div className={`container ${styles.container}`}>
        <header className={styles.header}>
          <span className="type-label">EGENHUB / DESIGN SYSTEM PREVIEW</span>
          <h1 className="type-h1">eGenHub</h1>
          <h2 className="type-h2">Typography & Button System</h2>
          <p className="type-body-large">
            A temporary preview of our typography, color themes and interactive
            button variations.
          </p>
        </header>

        <section className={styles.section}>
          <span className="type-label">01 / BUTTON VARIANTS & THEMES</span>

          <div className={styles.variantGrid}>
            {variants.map((variant) => (
              <article className={styles.variantCard} key={variant}>
                <span className={styles.cardTitle}>{variant}</span>

                <div className={styles.themeList}>
                  {themes.map((theme) => (
                    <div className={styles.sample} key={theme}>
                      <span className={styles.themeLabel}>{theme}</span>
                      <Button variant={variant} theme={theme} size="md">
                        {variant === "primary"
                          ? "Get started"
                          : variant === "secondary"
                            ? "Explore"
                            : "Learn more"}
                      </Button>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <span className="type-label">02 / BUTTON SIZES</span>

          <div className={styles.buttonRow}>
            <Button variant="primary" theme="lime" size="sm">
              Small
            </Button>
            <Button variant="primary" theme="lime" size="md">
              Medium
            </Button>
            <Button variant="primary" theme="lime" size="lg">
              Large
            </Button>
          </div>
        </section>

        <section className={styles.section}>
          <span className="type-label">03 / ICON VARIATIONS</span>

          <div className={styles.buttonRow}>
            <Button variant="primary" theme="lime" size="md">
              Without icon
            </Button>

            <Button
              variant="primary"
              theme="lime"
              size="md"
              icon={<span>↗</span>}
              iconPosition="end"
            >
              Icon at end
            </Button>

            <Button
              variant="secondary"
              theme="light"
              size="md"
              icon={<span>↗</span>}
              iconPosition="start"
            >
              Icon at start
            </Button>

            <Button
              variant="tertiary"
              theme="dark"
              size="md"
              icon={<span>↗</span>}
              aria-label="Open"
            />
          </div>
        </section>

        <section className={styles.section}>
          <span className="type-label">04 / NAVIGATION BUTTON</span>

          <div className={styles.buttonRow}>
            <ButtonLink
              href="/"
              variant="primary"
              theme="lime"
              size="lg"
              icon={<span>↗</span>}
            >
              Navigate home
            </ButtonLink>
          </div>
        </section>
      </div>
    </main>
  );
}
