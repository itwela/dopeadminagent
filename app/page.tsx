"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-8">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Database Admin Agent
          </h1>
          <p className="text-2xl text-slate-600 dark:text-slate-300">
            Multi-database utilities ready for AI agents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12">
          <Link
            href="/test-functions/dope-core"
            className="group bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-purple-500 hover:scale-105"
          >
            <div className="text-5xl mb-4">🟣</div>
            <div className="text-xl font-bold text-purple-500 mb-2">Dope Core</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Test functions →
            </div>
          </Link>

          <Link
            href="/test-functions/attom"
            className="group bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all border-2 border-green-500 hover:scale-105"
          >
            <div className="text-5xl mb-4">🟢</div>
            <div className="text-xl font-bold text-green-500 mb-2">ATTOM</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Test functions →
            </div>
          </Link>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg opacity-50 border-2 border-slate-300 dark:border-slate-600">
            <div className="text-5xl mb-4">⚪</div>
            <div className="text-xl font-bold text-slate-500 mb-2">Database 3</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Coming soon...
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 text-sm text-slate-500">
          <p>2 of 3 databases connected</p>
        </div>
      </div>
    </div>
  );
}
