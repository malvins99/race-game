"use client";

import { useState, useEffect } from "react";

type QuizQuestion = {
    id: number;
    question: string;
    options: string[];
    answer: string;
};

export default function QuizOverlay({
    isActive,
    question,
    onAnswer
}: {
    isActive: boolean;
    question: QuizQuestion | null;
    onAnswer: (correct: boolean) => void;
}) {
    const [timeLeft, setTimeLeft] = useState(10);

    useEffect(() => {
        if (!isActive || !question) return;

        setTimeLeft(10);
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onAnswer(false); // Time out counts as wrong/no answer
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isActive, question, onAnswer]);

    if (!isActive || !question) return null;

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-background-dark border-2 border-primary rounded-2xl shadow-[0_0_30px_rgba(234,42,51,0.5)] overflow-hidden animate-bounce-in">
                <div className="bg-primary p-4 flex justify-between items-center">
                    <h2 className="text-white font-bold text-xl flex items-center gap-2">
                        <span className="material-symbols-outlined">quiz</span>
                        QUIZ TIME!
                    </h2>
                    <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
                        <span className="material-symbols-outlined text-accent">timer</span>
                        <span className={`font-bold font-mono text-lg ${timeLeft <= 3 ? 'text-red-300 animate-pulse' : 'text-white'}`}>
                            {timeLeft}s
                        </span>
                    </div>
                </div>

                <div className="p-6 flex flex-col gap-6">
                    <p className="text-white text-lg md:text-xl font-medium text-center leading-relaxed">
                        {question.question}
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {question.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => onAnswer(option === question.answer)}
                                className="py-4 px-6 rounded-xl bg-[#2a1617] border border-border-dark text-slate-200 hover:bg-slate-800 hover:border-accent hover:text-accent transition-all font-medium text-sm md:text-base active:scale-95"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="h-2 bg-slate-800 w-full">
                    <div
                        className="h-full bg-accent transition-all duration-1000 ease-linear"
                        style={{ width: `${(timeLeft / 10) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
