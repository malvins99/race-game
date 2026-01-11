'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import charactersData from '../../data/characters.json';

type Character = {
    id: string;
    name: string;
    speed: number;
    acceleration: number;
    sprite: string;
    color: string;
};

export default function CharacterSelection() {
    const [characters, setCharacters] = useState<Character[]>([]);
    const [selectedChar, setSelectedChar] = useState<Character | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Simulating fetching data. In a real app, this might be an API call.
        setCharacters(charactersData);
    }, []);

    const handleStartRace = () => {
        if (selectedChar) {
            // Save selected character to local storage or context
            localStorage.setItem('selectedCharacter', JSON.stringify(selectedChar));
            router.push('/lobby'); // Or straight to play if solo
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex flex-col items-center justify-center p-4">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 drop-shadow-md text-center">
                Choose Your Racer!
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full">
                {characters.map((char) => (
                    <div
                        key={char.id}
                        onClick={() => setSelectedChar(char)}
                        className={`
              relative bg-white/10 backdrop-blur-md rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 border-4
              ${selectedChar?.id === char.id ? `border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.6)]` : 'border-transparent hover:border-white/50'}
            `}
                    >
                        <div className={`w-full h-32 mb-4 bg-gradient-to-t from-${char.color} to-transparent rounded-xl flex items-center justify-center`}>
                            {/* Placeholder for sprite if image fails/is missing during dev */}
                            <span className="text-6xl">🏎️</span>
                            {/* <img src={char.sprite} alt={char.name} className="h-full object-contain" /> */}
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-2 text-center">{char.name}</h2>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-white/80">
                                <span>Speed</span>
                                <div className="flex gap-1">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className={`h-2 w-2 rounded-full ${i < char.speed ? 'bg-yellow-400' : 'bg-gray-600'}`} />
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-white/80">
                                <span>Accel</span>
                                <div className="flex gap-1">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className={`h-2 w-2 rounded-full ${i < char.acceleration ? 'bg-green-400' : 'bg-gray-600'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12">
                <button
                    onClick={handleStartRace}
                    disabled={!selectedChar}
                    className={`
            px-12 py-4 rounded-full text-2xl font-bold uppercase tracking-wider transition-all duration-300
            ${selectedChar
                            ? 'bg-yellow-400 text-black shadow-lg hover:shadow-yellow-400/50 hover:scale-105 active:scale-95'
                            : 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50'}
          `}
                >
                    {selectedChar ? `Select ${selectedChar.name}` : 'Select a Racer'}
                </button>
            </div>
        </div>
    );
}
