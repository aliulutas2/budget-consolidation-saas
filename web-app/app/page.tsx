import Link from 'next/link';
import {
  XCircle,
  CheckCircle2,
  Globe,
  Lock,
  BarChart3,
  ArrowRight
} from 'lucide-react'; // Using lucide-react now

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <Hero />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </>
  );
}

function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="logo">BudgetOne</div>
        <div className="nav-links">
          <Link href="#features">Özellikler</Link>
          <Link href="#how-it-works">Nasıl Çalışır?</Link>
          <Link href="/login" className="btn btn-primary">Giriş Yap</Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="hero">
      <div className="container hero-content">
        <h1 className="hero-title">Global Bütçenizi <br /> <span className="gradient-text">Tek Ekranda</span> Yönetin.</h1>
        <p className="hero-subtitle">Çok lokasyonlu işletmeler için tasarlanmış, Excel kaosunu bitiren, gerçek zamanlı
          bütçe konsolidasyon platformu.</p>

        <div className="hero-actions">
          <Link href="/login" className="btn btn-primary btn-lg">Erken Erişim İçin Katılın</Link>
          <Link href="/login" className="btn btn-secondary btn-lg">Demoyu İncele</Link>
        </div>

        {/* Abstract Dashboard Preview (Mockup) */}
        <div className="hero-visual">
          <div className="mockup-window">
            <div className="mockup-header">
              <span className="dot red"></span>
              <span className="dot yellow"></span>
              <span className="dot green"></span>
            </div>
            <div className="mockup-body">
              <div className="metric-card">
                <span>Total Budget (Q1)</span>
                <h3>₺450,000,000</h3>
              </div>
              <div className="metric-card">
                <span>Approved Locations</span>
                <h3>12 / 15</h3>
              </div>
              <div className="chart-preview">
                <div className="bar" style={{ height: '60%' }}></div>
                <div className="bar" style={{ height: '80%' }}></div>
                <div className="bar active" style={{ height: '100%' }}></div>
                <div className="bar" style={{ height: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function ProblemSolution() {
  return (
    <section className="section problem-solution">
      <div className="container">
        <div className="grid-2">
          <div className="content-box">
            <h2 className="section-title">Why BudgetOne?</h2>
            <p className="section-text">Stop dealing with data lost in thousands of Excel files, erroneous versions,
              and email traffic.</p>
            <ul className="feature-list">
              <li><XCircle size={20} /> Manual data merging errors</li>
              <li><XCircle size={20} /> Outdated budget versions</li>
              <li><XCircle size={20} /> Time loss in approval processes</li>
            </ul>
          </div>
          <div className="content-box highlight-box">
            <h3>Our Solution</h3>
            <ul className="solution-list">
              <li>
                <CheckCircle2 size={24} />
                <div>
                  <strong>Centralized Management</strong>
                  <p>All branches enter data into a single system, in a single format.</p>
                </div>
              </li>
              <li>
                <CheckCircle2 size={24} />
                <div>
                  <strong>Instant Consolidation</strong>
                  <p>Data is reflected in the overall total as soon as it's entered. No waiting.</p>
                </div>
              </li>
              <li>
                <CheckCircle2 size={24} />
                <div>
                  <strong>Flexible Chart of Accounts</strong>
                  <p>Define your own chart of accounts (CoA) suitable for your corporate structure.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="section features">
      <div className="container">
        <div className="section-header">
          <h2>Powerful Features</h2>
          <p>Tools that simplify complex structures.</p>
        </div>
        <div className="grid-3">
          <div className="feature-card">
            <Globe />
            <h3>Multi-Location</h3>
            <p>Wherever they are in the world, department managers securely upload their budgets to the system.</p>
          </div>
          <div className="feature-card">
            <Lock />
            <h3>Role-Based Authorization</h3>
            <p>Each user only sees and edits the areas they are responsible for. Data security is paramount.</p>
          </div>
          <div className="feature-card">
            <BarChart3 />
            <h3>Advanced Reporting</h3>
            <p>Instantly visualize consolidated data. Perform branch-based profitability and expense analyses.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="section how-it-works">
      <div className="container">
        <h2 className="section-title center">How It Works?</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Define</h4>
            <p>As an admin, create account items and branches.</p>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>Collect</h4>
            <p>Managers enter the budgets they are responsible for into the system.</p>
          </div>
          <div className="step-line"></div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Manage</h4>
            <p>The system automatically consolidates all data.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section id="contact" className="section cta">
      <div className="container cta-content">
        <h2>Ready to Get Rid of Excel?</h2>
        <p>Speed up your budget processes by 80% with BudgetOne.</p>
        <form className="waitlist-form">
          <input type="email" placeholder="Your email address" required />
          <button type="submit" className="btn btn-primary">Notify Me</button>
        </form>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-bottom">
          &copy; 2024 BudgetOne SaaS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
