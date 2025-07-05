import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Users, Heart, Zap, TrendingUp, Globe, HeartHandshake, MapPin, BookOpen, Sparkles, Clock } from "lucide-react";

export default function CollectiveResiliencePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back button */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        {/* Header */}
        <div className="space-y-4 mb-8">
          <Logo className="text-2xl sm:text-3xl" />
          <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">
            Building Our Archive
          </h1>
        </div>
        
        {/* Main content */}
        <div className="space-y-8">
          {/* Introduction */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6 sm:p-8">
            <p className="text-base sm:text-lg leading-relaxed">
              Every story shared strengthens our community's voice. Together, we're creating a living archive of how we navigate difficult times, support each other, and persist.
            </p>
          </div>

          {/* The power of collective storytelling */}
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-4">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
              <h2 className="font-bold text-lg">Something Powerful Happens</h2>
            </div>
            <p className="text-base leading-relaxed">
              When you share your story here, something powerful happens. Your individual experience becomes part of a larger tapestry—a collective record of resilience that no single voice could create alone.
            </p>
          </div>

          {/* Stories from everywhere */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
              <h2 className="font-bold text-lg">Threads From Everywhere</h2>
            </div>
            <p className="text-base leading-relaxed">
              Each story adds another thread: the teenager in Texas finding hope. The parent in Florida making impossible choices. The elder in Tennessee sharing decades of survival wisdom. The young professional in Ohio navigating workplace challenges. Together, these threads weave an undeniable truth: we are everywhere, we are diverse, and we are strong.
            </p>
          </div>

          {/* Full spectrum grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h3 className="font-bold">The Full Spectrum</h3>
              </div>
              <p className="text-sm leading-relaxed">
                This isn't just about documenting hardship. It's about capturing the full spectrum of our experiences—the fear and the joy, the struggles and the celebrations, the isolation and the connection.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h3 className="font-bold">Creating Beauty</h3>
              </div>
              <p className="text-sm leading-relaxed">
                It's about showing how we find light in darkness, how we create family where we find it, how we build lives worth living even when the world tells us we shouldn't exist.
              </p>
            </div>
          </div>

          {/* Future generations */}
          <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-4">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
              <h2 className="font-bold text-lg">For Future Generations</h2>
            </div>
            <p className="text-base leading-relaxed">
              Future generations will look back at this archive and see more than just survival. They'll see how we loved, how we fought, how we created beauty in the midst of chaos. They'll see that we refused to be silenced, that we insisted on being witnessed, that we wrote our own stories when others tried to write them for us.
            </p>
          </div>

          {/* Who needs your story */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-6 sm:p-8">
            <div className="flex items-start gap-3 mb-4">
              <Heart className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              <h2 className="font-bold text-lg">Your Story Matters Beyond You</h2>
            </div>
            <p className="text-base leading-relaxed">
              Your story doesn't just matter for you. It matters for the questioning kid who will find this archive five years from now and realize they're not alone. It matters for the researcher documenting our history. It matters for the person reading it tomorrow who needs to hear exactly what you have to say.
            </p>
          </div>

          {/* How we survive */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 sm:p-8">
            <p className="text-base sm:text-lg leading-relaxed font-semibold">
              This is how we survive: together. This is how we thrive: by refusing to let our stories go untold.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-8">
            <Link href="/signup" className="flex-1">
              <Button className="w-full" size="lg">
                Start Writing
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" size="lg" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}