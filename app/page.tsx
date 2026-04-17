import ClosingCTA from "@/components/marketing/ClosingCTA";
import Footer from "@/components/marketing/Footer";
import Hero from "@/components/marketing/Hero";
import HowItWorks from "@/components/marketing/HowItWorks";
import LeaderboardPreview from "@/components/marketing/LeaderboardPreview";
import Nav from "@/components/marketing/Nav";
import Ticker from "@/components/marketing/Ticker";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Nav />
      <Hero />
      <Ticker />
      <HowItWorks />
      <LeaderboardPreview />
      <ClosingCTA />
      <Footer />
    </main>
  );
}
