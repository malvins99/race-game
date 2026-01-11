"use client";

import { useState, useEffect } from "react";

type Question = {
    id: number;
    question: string;
    options: string[];
    correct: number;
};

// Dummy Data - In real app, fetch based on 'topic'
const QUESTIONS: Record<string, Question[]> = {
    general: [
        { id: 1, question: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2 },
        { id: 2, question: "Which planet is known as the Red Planet?", options: ["Mars", "Venus", "Jupiter", "Saturn"], correct: 0 },
        { id: 3, question: "What is 5 + 7?", options: ["10", "11", "12", "13"], correct: 2 },
        { id: 4, question: "Who wrote 'Romeo and Juliet'?", options: ["Shakespeare", "Dickens", "Hemingway", "Orwell"], correct: 0 },
        { id: 5, question: "What is the largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3 },
    ],
    math: [
        { id: 1, question: "What is 12 x 8?", options: ["86", "96", "108", "92"], correct: 1 },
        { id: 2, question: "Value of Pi starts with?", options: ["3.12", "3.14", "3.16", "3.18"], correct: 1 },
        { id: 3, question: "Square root of 81?", options: ["7", "8", "9", "10"], correct: 2 },
        { id: 4, question: "15% of 200?", options: ["20", "25", "30", "35"], correct: 2 },
        { id: 5, question: "Degrees in a circle?", options: ["180", "90", "360", "270"], correct: 2 },
    ]
};

interface QuizPhaseProps {
    topic: string;
    onComplete: (score: number) => void;
    isFinal?: boolean;
    questionCount?: number;
}

export default function QuizPhase({ topic, onComplete, isFinal = false, questionCount = 5 }: QuizPhaseProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);

    const questions = QUESTIONS[topic.toLowerCase()] || QUESTIONS['general'];
    const currentQ = questions[currentIndex];

    useEffect(() => {
        if (currentIndex >= questionCount) { // Ensure only specified question count
            onComplete(score);
        }
    }, [currentIndex, score, onComplete, questionCount]);

    const handleAnswer = (optionIndex: number) => {
        if (optionIndex === currentQ.correct) {
            setScore(s => s + 1);
            // Only play sound or effect here
        }
        // Simple transition
        if (currentIndex < questionCount - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            // Finished
            onComplete(score + (optionIndex === currentQ.correct ? 1 : 0));
        }
    };

    if (currentIndex >= questionCount) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-[#2A1818] border-2 border-[#472426] rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in zoom-in">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 w-full h-2 bg-black/50">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((currentIndex + 1) / 5) * 100}%` }}></div>
                </div>

                <div className="text-center mb-8 mt-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
                        {isFinal ? "FINAL CHALLENGE" : "SPEED BOOST ROUND"} • Question {currentIndex + 1} of 5
                    </span>
                    <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                        {currentQ.question}
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQ.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleAnswer(idx)}
                            className="p-6 rounded-xl bg-white/5 hover:bg-primary border-2 border-white/5 hover:border-primary text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-95 text-left flex items-center gap-4 group"
                        >
                            <span className="size-8 rounded-full bg-white/10 group-hover:bg-white text-white group-hover:text-primary flex items-center justify-center text-sm font-black">
                                {String.fromCharCode(65 + idx)}
                            </span>
                            {opt}
                        </button>
                    ))}
                </div>

                {/* Decor */}
                <div className="absolute -bottom-10 -right-10 text-white/5 text-9xl font-black select-none pointer-events-none">
                    ?
                </div>
            </div>
        </div>
    );
}
