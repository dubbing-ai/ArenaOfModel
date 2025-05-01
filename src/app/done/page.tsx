// app/thank-you/page.tsx (if using Next.js 13+ App Router)

import React from "react";

export default function ThankYouPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white text-gray-800 p-4">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-4xl font-bold">🎉 Thank You!</h1>
        <p className="text-lg">
          We really appreciate you taking the time to score our project.
        </p>
        <p className="text-md text-gray-600">
          Your feedback helps us improve and grow.
        </p>
      </div>
    </main>
  );
}
