import BallTrail from "@/components/marketing/BallTrail";
import ClosingCTA from "@/components/marketing/ClosingCTA";
import Footer from "@/components/marketing/Footer";
import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import LeaderboardPreview from "@/components/marketing/LeaderboardPreview";
import Nav from "@/components/marketing/Nav";
import Ticker from "@/components/marketing/Ticker";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col">
      <Nav />
      <Hero />
      <Ticker />
      <BallTrail
        heightVh={26}
        d="M 88 6 C 72 0, 44 -4, 30 22 S 20 72, 10 96"
      />
      <HowItWorks />
      <BallTrail
        heightVh={24}
        d="M 10 6 C 28 0, 58 6, 66 30 S 82 74, 92 96"
      />
      <LeaderboardPreview />
      <ClosingCTA />
      <Footer />
    </main>
  );
}
