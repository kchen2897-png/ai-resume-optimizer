"use client";

interface ScoreCardProps {
  score: number;
  compact?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "from-emerald-500 to-green-600";
  if (score >= 60) return "from-amber-500 to-orange-500";
  return "from-red-500 to-rose-600";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "优秀";
  if (score >= 80) return "良好";
  if (score >= 60) return "一般";
  return "需改进";
}

export default function ScoreCard({ score, compact }: ScoreCardProps) {
  if (compact) {
    return (
      <div className={`flex items-center justify-center rounded-full bg-gradient-to-br ${getScoreColor(score)} h-16 w-16 flex-shrink-0 shadow-md`}>
        <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-white">
          <span className="text-2xl font-extrabold text-gray-900">{score}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
      <div
        className={`flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${getScoreColor(score)} shadow-lg`}
      >
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white">
          <span className="text-4xl font-extrabold text-gray-900">
            {score}
          </span>
        </div>
      </div>
      <p className="mt-4 text-lg font-semibold text-gray-700">
        {getScoreLabel(score)}
      </p>
      <p className="mt-1 text-xs text-gray-400">简历综合评分</p>
    </div>
  );
}
