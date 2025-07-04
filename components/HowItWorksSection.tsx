import { PenTool, Sparkles, Mic, Play } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Write",
      description: "Share your story in your own words. 1000 characters, complete anonymity.",
      icon: PenTool,
      color: "blue",
    },
    {
      number: "2", 
      title: "Refine",
      description: "Optional AI assistance to clarify your message while keeping your authentic voice.",
      icon: Sparkles,
      color: "purple",
    },
    {
      number: "3",
      title: "Voice", 
      description: "Choose from 8 AI voices to bring your story to life. No human recordings.",
      icon: Mic,
      color: "green",
    },
    {
      number: "4",
      title: "Publish",
      description: "Preview your audio story and share it with the world. Forever preserved.",
      icon: Play,
      color: "orange",
    },
  ];

  return (
    <div className="w-full py-8">
      <h3 className="text-2xl font-bold text-center mb-12">
        How It Works
      </h3>
      
      <div className="grid md:grid-cols-4 gap-8 relative">
        {/* Connection line - hidden on mobile */}
        <div className="hidden md:block absolute top-12 left-16 right-16 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 via-green-200 to-orange-200 dark:from-blue-800 dark:via-purple-800 dark:via-green-800 dark:to-orange-800" />
        
        {steps.map((step, index) => {
          const Icon = step.icon;
          const colorClasses = {
            blue: "bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400",
            purple: "bg-purple-100 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400",
            green: "bg-green-100 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400",
            orange: "bg-orange-100 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400",
          };
          
          const bgColorClass = colorClasses[step.color as keyof typeof colorClasses];
          
          return (
            <div key={step.number} className="relative">
              {/* Step number circle */}
              <div className={`w-12 h-12 rounded-full border-2 ${bgColorClass} flex items-center justify-center font-bold text-lg mx-auto mb-4 relative z-10 bg-white dark:bg-gray-900`}>
                {step.number}
              </div>
              
              {/* Icon and content */}
              <div className="text-center space-y-3">
                <div className={`w-16 h-16 rounded-lg ${bgColorClass} border flex items-center justify-center mx-auto`}>
                  <Icon className="w-8 h-8" />
                </div>
                
                <h4 className="font-bold text-lg">{step.title}</h4>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {/* Arrow for mobile */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center mt-6 mb-6">
                  <div className="w-0.5 h-12 bg-gray-300 dark:bg-gray-700" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="text-center mt-12">
        <p className="text-gray-600 dark:text-gray-400">
          Your story becomes part of history. Your identity remains yours alone.
        </p>
      </div>
    </div>
  );
}